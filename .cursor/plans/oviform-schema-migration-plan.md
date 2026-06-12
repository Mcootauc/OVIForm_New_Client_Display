# OVIForm Schema Migration Plan

**Purpose:** Refactor the OVIForm Supabase database from a denormalized, single-hospital-shaped structure into a normalized, multi-tenant structure that scales across Vet Villa Hospital, Valley Veterinary Hospital, and many additional vet practices going forward.

**Critical constraint:** **No data loss.** Every row currently in `VVH_Clients`, `clients`, `pets`, `breeds`, `hospitals`, and `profiles` must be preserved, including all `created_at` / `timestamp` values so historical metrics (signup volume over time, etc.) remain intact.

This document is the **planning prompt** for Cursor. Do not write or apply migration SQL based on this doc alone — produce a detailed implementation plan first, get it approved, then execute.

---

## 1. Context

OVIForm currently powers two intake forms for Vet Villa Hospital:

- **New Client form** — registers a new owner *and* their first pet at the same time
- **New Pet form** — registers an additional pet for an owner who already exists

Today, both forms write to a denormalized `clients` table that mixes owner fields (name, address, phone, email) with pet fields (pet_name, species, breed, birth_date, sex, microchip, etc.). The `pets` table exists but is barely used (3 rows) and has no foreign-key relationship back to a client.

Going forward, this product needs to support many vet practices, each with their own clients, pets, and staff users.

## 2. Goals

1. Normalize `clients` to hold **only owner/contact information**, with one row per owner per hospital.
2. Normalize `pets` to hold **only pet information**, linked to its owner via a `client_id` foreign key. One client can have many pets.
3. Both forms (New Client, New Pet) write to the same normalized tables — the form is just UI.
4. All tables are scoped to a `hospital_id` so a single Supabase project cleanly serves Vet Villa, Valley Vet, and future practices.
5. Switch `clients.id` and `pets.id` from `bigint` to `uuid` so IDs can be safely exposed in URLs without leaking volume across tenants, and so the New Client form can generate both IDs client-side and insert client + pet in a single transaction.
6. Preserve every existing row and every `created_at` timestamp.
7. Fix the security issue on `breeds` (RLS currently disabled).

## 3. Non-Goals

- Not redesigning the `profiles` / auth model (already fine).
- Not converting `hospitals.id` to UUID — it's a small private lookup table, bigint is appropriate.
- Not promoting `breed` from a text field to a foreign key into `breeds`. Keep `breed` as text for flexibility; `breeds` stays as an autocomplete reference table.
- Not changing how the forms render or are routed; only changing what they write.

## 4. Current State Snapshot

```
hospitals          (3 rows)    keep as-is, bigint id
profiles           (5 rows)    keep as-is, references hospitals
breeds             (329 rows)  keep, but enable RLS
clients            (548 rows)  REDO — mixes owner + pet fields, bigint id
pets               (3 rows)    REDO — no client_id, has stray owner fields
VVH_Clients        (39 rows)   LEGACY — predecessor of clients, must be merged in
```

Notes:
- `VVH_Clients` has a `timestamp` column that `clients` does not. Treat `VVH_Clients.timestamp` as the row's original creation time during migration.
- `clients` and `VVH_Clients` may contain overlapping owners. The migration must dedupe by `hospital_id` + best-available identity key (see §7).
- `pets` (3 rows) has no `client_id`; matching to owners must be attempted by `owner_name` + `email`/`cell_phone`. Any unmatched row is moved into a quarantine column for manual review rather than dropped.

## 5. Target Schema

### `hospitals` (unchanged)

```
id          bigint  PK
name        text    not null
slug        text    unique
created_at  timestamptz default now()
```

### `clients` (new shape — owner only)

```
id                              uuid           PK, default gen_random_uuid()
hospital_id                     bigint         not null, FK -> hospitals.id
owner_name                      text           not null
secondary_contact_name          text           nullable
secondary_contact_cell_phone    text           nullable
street                          text           nullable
city                            text           nullable
state                           text           nullable
zip_code                        text           nullable
cell_phone                      text           nullable
email                           text           nullable
initials                        text           nullable   -- staff who entered
created_at                      timestamptz    not null, default now()
```

Indexes:
- `(hospital_id, lower(email))`
- `(hospital_id, cell_phone)`
- `(hospital_id, owner_name)`

### `pets` (new shape — pet only, linked to client)

```
id                  uuid           PK, default gen_random_uuid()
client_id           uuid           not null, FK -> clients.id ON DELETE RESTRICT
hospital_id         bigint         not null, FK -> hospitals.id
pet_name            text           not null
species             text           nullable
breed               text           nullable      -- free text; breeds table is just autocomplete
birth_date          date           nullable      -- type changed from timestamptz
sex                 text           nullable
spayed_or_neutered  text           nullable
color               text           nullable
microchip           text           nullable
initials            text           nullable
created_at          timestamptz    not null, default now()
```

Indexes:
- `(client_id)`
- `(hospital_id)`
- `(hospital_id, microchip)` where `microchip is not null`

### Why `hospital_id` is duplicated on `pets`

It is denormalized on purpose. With `hospital_id` on the row itself, RLS policies become a single-column comparison instead of a join through `clients`. A `BEFORE INSERT` trigger should auto-populate `pets.hospital_id` from the parent client so application code never has to set it manually and it can never drift out of sync.

### `breeds` (unchanged shape, RLS enabled)

```
id       bigint  PK
species  text    not null
name     text    nullable
```

Action: `ALTER TABLE public.breeds ENABLE ROW LEVEL SECURITY;` plus add a read-only policy for `authenticated` (and `anon` if needed for the public intake forms). Confirm the form intake path needs `anon` access before writing the policy.

### `profiles` (unchanged)

No changes.

## 6. Migration Strategy: Parallel Tables, Verify, Cut Over

Rather than mutating `clients` and `pets` in place — which would mean changing primary key types and dropping columns while live data depends on them — create new tables alongside the old ones, migrate every row, verify, switch the app over, and only then archive the originals.

**Phase order:**

1. **Phase 1 — Additive:** create `clients_v2`, `pets_v2`, indexes, triggers, RLS policies. Old tables untouched.
2. **Phase 2 — Backfill:** copy data from `VVH_Clients`, `clients`, and `pets` into the v2 tables with deterministic UUIDs (see §7 deduplication).
3. **Phase 3 — Verify:** run row-count and sample-integrity checks (see §9). Do not proceed if any check fails.
4. **Phase 4 — App cutover:** Cursor updates the API / Edge Functions / frontend to read and write `clients_v2` / `pets_v2`. Both forms now write to the new tables.
5. **Phase 5 — Soft retire:** rename old tables to `clients_legacy`, `pets_legacy`, `VVH_Clients_legacy`. Keep them in the database for at least 30 days post-cutover as a safety net.
6. **Phase 6 — Promote names:** rename `clients_v2` → `clients`, `pets_v2` → `pets` once Phase 4 has been stable for the soak period.
7. **Phase 7 — Final drop:** only after the user explicitly approves, drop the `_legacy` tables.

Every phase is reversible up through Phase 5.

## 7. Field-Level Migration Mapping

### Sources of `clients_v2` rows

Pull from `VVH_Clients` AND `clients`. Each becomes one row in `clients_v2`, deduplicated.

| `clients_v2` column | from `clients`                  | from `VVH_Clients`              |
|---|---|---|
| `id`                            | `gen_random_uuid()` (new)        | `gen_random_uuid()` (new)        |
| `hospital_id`                   | `clients.hospital_id`            | lookup hospitals.slug = 'vvh' (or whichever slug represents Vet Villa) |
| `owner_name`                    | `owner_name`                     | `owner_name`                     |
| `secondary_contact_name`        | `secondary_contact_name`         | NULL                             |
| `secondary_contact_cell_phone`  | `secondary_contact_cell_phone`   | NULL                             |
| `street`, `city`, `state`, `zip_code` | same                       | same                             |
| `cell_phone`, `email`           | same                             | same                             |
| `initials`                      | `initials`                       | `initials`                       |
| `created_at`                    | `created_at`                     | `COALESCE(timestamp, created_at)` |

**Dedup rule for VVH_Clients → clients overlap:** for each `VVH_Clients` row, check if a row already exists in the `clients_v2` insert set with the same `hospital_id` AND a matching `(lower(email))` OR matching `(cell_phone)` OR matching `(lower(owner_name) + zip_code)`. If a match exists, skip the insert and instead store the original `VVH_Clients.id` in a transient mapping table for traceability. If no match, insert as a fresh client.

The mapping table preserves the link between every legacy `(table, bigint id)` and the new `uuid`, so historical references can be reconstructed later if needed:

```
legacy_id_map
  source_table   text     -- 'clients' | 'VVH_Clients' | 'pets'
  source_id      bigint
  new_client_id  uuid     nullable
  new_pet_id     uuid     nullable
  migrated_at    timestamptz default now()
  PRIMARY KEY (source_table, source_id)
```

This table is permanent — do not drop it. It is the audit trail for the migration.

### Sources of `pets_v2` rows

Pull from **three** sources:

**A. The pet columns embedded in `clients`** (548 rows — most of the existing pet data lives here)

| `pets_v2` column | from `clients`                              |
|---|---|
| `id`                  | `gen_random_uuid()`                          |
| `client_id`           | the new `clients_v2.id` for this same `clients.id` (via legacy_id_map) |
| `hospital_id`         | `clients.hospital_id`                        |
| `pet_name`            | `pet_name`                                   |
| `species`             | `species`                                    |
| `breed`               | `breed`                                      |
| `birth_date`          | `birth_date::date` (cast away time component)|
| `sex`, `spayed_or_neutered`, `color`, `microchip` | same                     |
| `initials`            | `initials`                                   |
| `created_at`          | `created_at`                                 |

Skip the insert if `pet_name` is NULL (no pet was attached to that owner row).

**B. The pet columns embedded in `VVH_Clients`** (39 rows)

Same mapping as (A), but `client_id` resolves through the dedup logic in §7 (could be a newly created client or a reused one matched to an existing `clients` row).

**C. The existing `pets` table** (3 rows, currently orphaned)

These rows have `owner_name`, `cell_phone`, `email` but no `client_id`. Attempt to resolve `client_id` by matching on:

1. `lower(email)` within the same hospital, then
2. `cell_phone` within the same hospital, then
3. `lower(owner_name)` within the same hospital.

If any of these matches a single client, set `client_id`. If zero matches or multiple matches, **do not skip the row** — insert it into a quarantine table `pets_unmatched` with all original fields plus the candidate match list, for manual review. Do not lose the data.

## 8. Triggers and RLS

### Trigger: auto-set `pets.hospital_id` from `client_id`

```
BEFORE INSERT ON pets_v2
FOR EACH ROW EXECUTE FUNCTION set_pet_hospital_from_client();
```

The function looks up `clients_v2.hospital_id WHERE id = NEW.client_id` and assigns it to `NEW.hospital_id`, overwriting whatever the app passed in. This guarantees the denormalized column never drifts.

### RLS policies (sketch — Cursor to finalize)

- `clients_v2` — `SELECT/INSERT/UPDATE` only where `hospital_id` matches the requesting user's `profiles.hospital_id`.
- `pets_v2` — same shape, on its own `hospital_id` column.
- `breeds` — read-only for `authenticated` (and `anon` if intake forms need it without login).
- `hospitals` — read-only for `authenticated`.
- `profiles` — user can read/update their own row; admins of a hospital can read all profiles for that hospital.

If the intake forms are filled out by anonymous users (no Supabase Auth session), insert policies for `anon` on `clients_v2` and `pets_v2` need to be written carefully — likely routed through a Postgres function or an Edge Function that enforces the `hospital_id` server-side rather than trusting client input.

## 9. Verification Checklist (run before Phase 4 cutover)

All of these must pass:

1. `SELECT COUNT(*) FROM clients_v2` ≥ `SELECT COUNT(*) FROM clients` (dedup means v2 may be slightly smaller if `VVH_Clients` rows merged into existing clients, but should never be smaller than `clients` alone).
2. Every row in `clients` has a corresponding entry in `legacy_id_map` (`source_table = 'clients'`).
3. Every row in `VVH_Clients` has a corresponding entry in `legacy_id_map` (`source_table = 'VVH_Clients'`).
4. `SELECT COUNT(*) FROM pets_v2` = (count of `clients` rows where `pet_name IS NOT NULL`) + (count of `VVH_Clients` rows where `pet_name IS NOT NULL` AND not deduped to an existing client+pet pair) + (count of `pets` rows that found a match).
5. No `pets_v2` row has a NULL `client_id` or NULL `hospital_id`.
6. For every `pets_v2` row, `pets_v2.hospital_id` = the `hospital_id` of its parent `clients_v2` row.
7. The `min(created_at)` and `max(created_at)` of `clients_v2` and `pets_v2` are consistent with the historical range from the source tables. Metrics over time should be reproducible.
8. Spot-check 5 random clients: pick a row from `clients`, look up its new uuid via `legacy_id_map`, fetch from `clients_v2`, confirm every field matches. Do the same for 5 pets.
9. The `pets_unmatched` quarantine table is reviewed and either resolved or explicitly accepted as orphaned-on-purpose by the user.

## 10. Rollback Plan

- **During Phase 1–3:** drop `clients_v2`, `pets_v2`, `legacy_id_map`, `pets_unmatched`. Original tables untouched.
- **During Phase 4 (cutover):** revert the app deployment. Old tables still hold the source of truth.
- **During Phase 5–6 (renames in effect):** rename back. `clients_legacy` → `clients`, etc. The `_v2` tables become the holding pen.
- **After Phase 7 (legacy dropped):** rollback no longer possible from inside the DB. Restore from Supabase point-in-time backup. This is why Phase 7 must be explicitly approved and only after a long soak.

## 11. Application Code Changes (high-level, Cursor to detail)

- Replace any query against `clients` that reads pet fields with a join from `clients` to `pets`.
- The New Client form: generate `uuid` for both client and pet client-side, send a single RPC / Edge Function call that inserts both rows in one transaction.
- The New Pet form: accept a `client_id` (uuid) from the form's client picker, insert one row into `pets`.
- Update TypeScript types via `supabase gen types`.
- Update any reporting / metrics queries that previously grouped by `clients.created_at` to also consider `pets.created_at` if the metric is pet-level (e.g., "new pets registered per month").

## 12. Cursor — How to Use This Doc

This is the **planning prompt**. Before writing or applying any migration SQL:

1. Read this whole document.
2. Read the current schema directly from Supabase (`list_tables` on project `uqdolredkukdkoolnubw`, schema `public`, verbose).
3. Produce a detailed implementation plan that includes:
   - The exact slug or identifier to use for Vet Villa in the `hospitals` table (verify against the live data — do not assume).
   - The exact SQL for each phase, as separate migration files.
   - The trigger function body.
   - The RLS policy bodies, including a decision on whether `anon` access is needed.
   - The verification queries from §9, expressed as runnable SQL.
4. **Wait for explicit approval of the plan before applying any migration.**
5. Apply phases one at a time. After each phase, run the verification queries and report the results.
6. Do not delete or `DROP` anything until explicitly told to do so. Renaming to `_legacy` is the maximum destructiveness allowed without a separate approval.

---

**End of plan.**
