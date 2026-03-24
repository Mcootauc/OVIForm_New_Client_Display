import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | OVIForm',
    description: 'Privacy Policy for OVIForm.',
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#FEFEFE] px-4 py-12 text-[#03045E]">
            <div className="mx-auto max-w-3xl rounded-lg border border-[#56A0AE]/30 bg-white p-8 shadow-sm">
                <div className="mb-8 border-b border-[#737373]/20 pb-6">
                    <p className="text-sm font-medium uppercase tracking-wide text-[#56A0AE]">
                        OVIForm
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">Privacy Policy</h1>
                    <p className="mt-3 text-sm text-[#737373]">
                        Effective date: March 23, 2026
                    </p>
                </div>

                <div className="space-y-6 text-sm leading-7 text-[#1f2937]">
                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Information We Collect
                        </h2>
                        <p>
                            OVIForm collects basic account information provided by
                            Google Sign-In, such as your name, email address, and
                            profile image, in order to authenticate authorized
                            users and provide access to the application.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            How We Use Information
                        </h2>
                        <p>
                            We use this information to verify access, operate the
                            application, maintain security, and support the client
                            management features provided by OVIForm.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Data Sharing
                        </h2>
                        <p>
                            We do not sell personal information. Information is only
                            shared with service providers necessary to host,
                            authenticate, and operate the application, such as our
                            hosting and database platforms.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Data Retention
                        </h2>
                        <p>
                            We retain information only as long as needed to provide
                            the service, comply with legal obligations, resolve
                            disputes, and enforce our agreements.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Security
                        </h2>
                        <p>
                            We take reasonable steps to protect account and
                            application data using access controls and managed
                            infrastructure providers. No method of transmission or
                            storage is guaranteed to be completely secure.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#03045E]">
                            Contact
                        </h2>
                        <p>
                            For privacy-related questions, contact{' '}
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
