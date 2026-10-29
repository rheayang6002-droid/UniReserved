import { Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0e2144] to-[#1a3a6e] flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#0e2144] to-[#1a3a6e] px-8 py-8 text-white text-center">
                        <Link href={home()} className="inline-flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                                <img
                                    src="/images/beo-logo.png"
                                    alt="BEO Logo"
                                    className="w-16 h-16 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl">🎓</span>';
                                    }}
                                />
                            </div>
                            <div>
                                <div className="font-bold text-xl">UniReserve</div>
                                <div className="text-blue-200 text-xs mt-0.5">Business Enterprise Office • DSSC</div>
                            </div>
                        </Link>
                        <div className="mt-5 border-t border-white/10 pt-5">
                            <h1 className="text-lg font-semibold">{title}</h1>
                            {description && (
                                <p className="text-blue-200 text-sm mt-1">{description}</p>
                            )}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="px-8 py-8">
                        {children}
                    </div>
                </div>

                {/* Back link */}
                <div className="text-center mt-4">
                    <Link href={home()} className="text-blue-200/60 hover:text-blue-200 text-sm transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
