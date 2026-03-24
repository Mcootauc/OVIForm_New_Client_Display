import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service | OVIForm',
    description: 'Terms of Service for OVIForm.',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#FEFEFE] px-4 py-12 text-[#03045E]">
            <div className="mx-auto max-w-3xl rounded-lg border border-[#56A0AE]/30 bg-white p-8 shadow-sm">
                <div className="mb-8 border-b border-[#737373]/20 pb-6">
                    <p className="text-sm font-medium uppercase tracking-wide text-[#56A0AE]">
                        OVIForm
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">Terms of Service</h1>
                    <p className="mt-3 text-sm text-[#737373]">
                        Effective date: March 23, 2026
                    </p>
                </div>

                <div className="space-y-6 text-sm leading-7 text-[#1f2937]">
                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Use of Service
                        </h2>
                        <p>
                            OVIForm is provided for authorized users to access and
                            manage client-related information. You agree to use the
                            service only for lawful business purposes and in a way
                            that does not interfere with the service or other users.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Account Access
                        </h2>
                        <p>
                            Access is restricted to approved accounts. You are
                            responsible for maintaining the confidentiality of your
                            login credentials and for any activity performed through
                            your account.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Availability
                        </h2>
                        <p>
                            We may update, suspend, or discontinue parts of the
                            service at any time. We do not guarantee uninterrupted
                            or error-free operation.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Limitation of Liability
                        </h2>
                        <p>
                            To the fullest extent permitted by law, OVIForm is
                            provided &quot;as is&quot; without warranties of any kind, and we
                            are not liable for indirect, incidental, special, or
                            consequential damages arising from use of the service.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Changes to These Terms
                        </h2>
                        <p>
                            We may revise these terms from time to time. Continued
                            use of OVIForm after changes become effective indicates
                            acceptance of the updated terms.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Contact
                        </h2>
                        <p>
                            For questions about these terms, contact{' '}
                            <a
                                className="text-[#56A0AE] underline underline-offset-4"
                                href="mailto:mcootauc@gmail.com"
                            >
                                mcootauc@gmail.com
                            </a>
                        </p>
                    </section>
                </div>

                <div className="mt-10 border-t border-[#737373]/20 pt-6 text-sm">
                    <Link
                        href="/login"
                        className="text-[#56A0AE] underline underline-offset-4"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        </main>
    );
}
