import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    PawPrint,
    Lock,
    Users,
    ListFilter,
    Shield,
    Stethoscope,
    ShieldCheck,
    Check,
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'OVIForm | Veterinary Dashboard',
    description: 'A secure internal dashboard that helps veterinary hospital staff manage, view, and organize client and pet records efficiently.',
};

export default function LandingPage() {
    const year = new Date().getFullYear();

    return (
        <div className="flex min-h-screen flex-col bg-[#FEFEFE]">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#03045E] shadow-sm">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-[18px]">
                    <Link href="/" className="flex items-center gap-2.5 text-[#FEFEFE]">
                        <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#FEFEFE]/10">
                            <PawPrint className="h-[19px] w-[19px]" />
                        </span>
                        <span className="text-2xl font-extrabold tracking-[-0.02em]">
                            OVIForm
                        </span>
                    </Link>
                    <Button
                        asChild
                        variant="outline"
                        className="border-[1.5px] border-[#56A0AE] bg-transparent text-[#FEFEFE] hover:border-[#FEFEFE] hover:bg-[#FEFEFE] hover:text-[#03045E]"
                    >
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section
                    id="top"
                    className="relative overflow-hidden bg-gradient-to-b from-[#FEFEFE] to-[#F3F8F9]"
                >
                    <div className="mx-auto max-w-[1000px] px-6 pb-[76px] pt-[88px] text-center">
                        <div className="mb-[26px] inline-flex items-center gap-2 rounded-full bg-[#56A0AE]/[0.12] px-3.5 py-1.5 text-[12.5px] font-semibold tracking-[0.02em] text-[#03045E]">
                            <Lock className="h-3.5 w-3.5 text-[#56A0AE]" />
                            Secure internal tool for authorized clinic staff
                        </div>
                        <h1 className="mx-auto max-w-[900px] text-[56px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#03045E]">
                            OVIForm Veterinary Dashboard
                        </h1>
                        <p className="mx-auto mt-6 max-w-[640px] text-[19px] leading-[1.6] text-[#737373]">
                            A secure internal dashboard that helps veterinary
                            hospital staff manage, view, and organize client and
                            pet records efficiently — all in one place.
                        </p>
                        <div className="mt-[38px] flex flex-wrap justify-center gap-3.5">
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-[1.5px] border-[#56A0AE] bg-transparent text-[15.5px] font-semibold text-[#03045E] hover:border-[#03045E] hover:bg-[#03045E] hover:text-[#FEFEFE]"
                            >
                                <Link href="/login">Go to Login</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* What OVIForm does / Functionality */}
                <section className="mx-auto max-w-[1140px] px-6 pb-10 pt-[78px]">
                    <div className="mx-auto mb-[52px] max-w-[660px] text-center">
                        <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[#56A0AE]">
                            What OVIForm does
                        </p>
                        <h2 className="text-[36px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#03045E]">
                            Built for veterinary hospital teams
                        </h2>
                        <p className="mx-auto mt-4 text-[17px] leading-[1.6] text-[#737373]">
                            OVIForm gives clinic staff a single, organized view
                            of the client and pet records they rely on every
                            day.
                        </p>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[22px]">
                        <FeatureCard
                            icon={<Users className="h-6 w-6 text-[#56A0AE]" />}
                            title="Client records"
                            description="Look up owner contact details and history in one organized, searchable view."
                        />
                        <FeatureCard
                            icon={<PawPrint className="h-6 w-6 text-[#56A0AE]" />}
                            title="Pet gallery"
                            description="Browse pet profiles with species, breed, and age at a glance for every client."
                        />
                        <FeatureCard
                            icon={<ListFilter className="h-6 w-6 text-[#56A0AE]" />}
                            title="Organized & efficient"
                            description="Everything the team needs to manage and view records efficiently, kept tidy and up to date."
                        />
                    </div>
                </section>

                {/* Who it's for */}
                <section className="mx-auto max-w-[1140px] px-6 pb-[30px] pt-10">
                    <div className="rounded-[20px] bg-[#03045E] px-11 py-[52px] text-[#FEFEFE]">
                        <div className="flex flex-wrap items-start justify-between gap-8">
                            <div className="min-w-[260px] flex-[1_1_300px]">
                                <h2 className="text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[#FEFEFE]">
                                    Access limited to authorized staff
                                </h2>
                                <p className="mt-4 max-w-[440px] text-[16px] leading-[1.65] text-[#FEFEFE]/[0.78]">
                                    OVIForm is an internal tool. Only verified
                                    members of the hospital team can sign in and
                                    view records — access level is confirmed at
                                    login.
                                </p>
                            </div>
                            <div className="flex min-w-[260px] flex-[1_1_300px] flex-col gap-3.5">
                                <RoleRow
                                    icon={<Shield className="h-5 w-5 text-[#FEFEFE]" />}
                                    title="Admins"
                                    description="Full oversight of clinic records"
                                />
                                <RoleRow
                                    icon={<Stethoscope className="h-5 w-5 text-[#FEFEFE]" />}
                                    title="Doctors / Vet Techs"
                                    description="Access to client and pet information"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data usage transparency (Google OAuth) */}
                <section id="data" className="mx-auto max-w-[1140px] px-6 py-11">
                    <div className="flex flex-wrap items-start gap-7 rounded-[18px] border-[1.5px] border-[#56A0AE] bg-[#56A0AE]/[0.06] px-10 py-11">
                        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-[14px] bg-[#56A0AE]">
                            <ShieldCheck className="h-7 w-7 text-[#FEFEFE]" />
                        </span>
                        <div className="min-w-[280px] flex-[1_1_420px]">
                            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em] text-[#56A0AE]">
                                Data usage transparency
                            </p>
                            <h2 className="mb-3.5 text-[26px] font-extrabold leading-[1.25] tracking-[-0.015em] text-[#03045E]">
                                Why OVIForm requests your Google data
                            </h2>
                            <p className="text-[16.5px] leading-[1.7] text-[#1f2937]">
                                OVIForm requests access to your Google profile
                                and email address solely to authenticate your
                                identity and verify your employment authorization
                                level within the hospital. This data is required
                                to grant access to the dashboard and is{' '}
                                <strong className="text-[#03045E]">
                                    not used or shared for any other purposes
                                </strong>.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2.5">
                                <TransparencyChip label="Used only to authenticate you" />
                                <TransparencyChip label="Verifies your authorization level" />
                                <TransparencyChip label="Never sold or shared" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Login CTA */}
                <section id="login" className="mx-auto max-w-[1140px] px-6 pb-[84px] pt-[30px]">
                    <div className="rounded-[20px] border border-[#737373]/[0.16] bg-gradient-to-b from-[#F3F8F9] to-[#FEFEFE] px-8 py-16 text-center">
                        <h2 className="mx-auto max-w-[560px] text-[34px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#03045E]">
                            Ready to access the dashboard?
                        </h2>
                        <p className="mx-auto mt-3.5 max-w-[480px] text-[16.5px] leading-[1.6] text-[#737373]">
                            Sign in with your authorized hospital Google account
                            to view client and pet records.
                        </p>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="mt-[30px] border-[1.5px] border-[#56A0AE] bg-white text-[15.5px] font-semibold text-[#03045E] hover:border-[#03045E] hover:bg-[#03045E] hover:text-[#FEFEFE]"
                        >
                            <Link href="/login" className="gap-2.5">
                                <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#737373]/20 bg-[#FEFEFE]">
                <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-between gap-4 px-6 py-[34px]">
                    <p className="text-sm text-[#737373]">
                        &copy; {year} OVIForm. All rights reserved.
                    </p>
                    <nav className="flex items-center gap-[26px]">
                        <Link
                            href="/privacy-policy"
                            className="text-sm text-[#737373] hover:text-[#03045E]"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm text-[#737373] hover:text-[#03045E]"
                        >
                            Terms of Service
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: Readonly<{ icon: React.ReactNode; title: string; description: string }>) {
    return (
        <div className="rounded-[14px] border border-[#737373]/[0.18] bg-white px-[26px] py-7 shadow-[0_1px_2px_rgba(3,4,94,0.04)]">
            <div className="mb-[18px] flex h-12 w-12 items-center justify-center rounded-xl bg-[#56A0AE]/[0.13]">
                {icon}
            </div>
            <h3 className="mb-2 text-[18.5px] font-bold text-[#03045E]">
                {title}
            </h3>
            <p className="text-[15px] leading-[1.6] text-[#737373]">
                {description}
            </p>
        </div>
    );
}

function RoleRow({
    icon,
    title,
    description,
}: Readonly<{ icon: React.ReactNode; title: string; description: string }>) {
    return (
        <div className="flex items-center gap-3.5 rounded-xl border border-[#FEFEFE]/[0.12] bg-[#FEFEFE]/[0.07] px-[18px] py-4">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-[#56A0AE]/[0.28]">
                {icon}
            </span>
            <div>
                <p className="text-[16px] font-bold text-[#FEFEFE]">{title}</p>
                <p className="mt-0.5 text-[13.5px] text-[#FEFEFE]/[0.68]">
                    {description}
                </p>
            </div>
        </div>
    );
}

function TransparencyChip({ label }: Readonly<{ label: string }>) {
    return (
        <span className="inline-flex items-center gap-[7px] rounded-full border border-[#56A0AE]/40 bg-white px-3.5 py-[7px] text-[13.5px] font-medium text-[#03045E]">
            <Check className="h-3.5 w-3.5 text-[#56A0AE]" strokeWidth={2.4} />
            {label}
        </span>
    );
}
