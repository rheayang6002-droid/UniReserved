import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldAlert, LogIn, UserPlus, ArrowLeft, Lock } from 'lucide-react';
import type { Auth } from '@/types/auth';

interface ErrorProps {
    status?: number;
    message?: string;
}

export default function ErrorPage({ status = 403, message }: ErrorProps) {
    const page = usePage<{ auth?: Auth }>();
    const user = page.props.auth?.user;

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-radial from-[#EEF2FF] via-[#F8FAFC] to-[#F1F5F9] overflow-hidden text-slate-800">
            <Head title={`${status} Forbidden — Access Restricted | UniReserve`} />

            {/* Ambient decorative glow orbs */}
            <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-gradient-to-br from-[#173B8F]/25 to-sky-400/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-80px] left-[-80px] w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg mx-auto">
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center shadow-2xl shadow-slate-900/10 transition-all">
                    {/* Top status pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full mb-6">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            HTTP {status} &bull; Authorization Gate
                        </span>
                    </div>

                    {/* Shield / Lock Illustration */}
                    <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 animate-[spin_25s_linear_infinite]" />
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#173B8F] to-[#06142D] flex items-center justify-center shadow-lg shadow-[#173B8F]/30 z-10">
                            <ShieldAlert className="w-12 h-12 text-white" />
                        </div>
                        <span className="absolute bottom-1 right-1 bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-20">
                            {status}
                        </span>
                    </div>

                    {/* Headings */}
                    <p className="text-xs font-bold uppercase tracking-widest text-[#173B8F] mb-1">
                        Access Restricted
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06142D] tracking-tight mb-3">
                        You Don't Have Access
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-md mx-auto">
                        {message ||
                            "You don't have permission to access this page. Please log in with an authorized account or create an account to continue."}
                    </p>

                    {/* Contextual user info badge */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 mb-6 inline-flex items-center justify-center gap-2 text-xs text-slate-600 w-full">
                        <Lock className="w-3.5 h-3.5 text-[#173B8F] shrink-0" />
                        <span className="truncate">
                            {user ? (
                                <>
                                    Logged in as <strong className="text-slate-900">{user.name}</strong> (Role: {user.role || 'User'})
                                </>
                            ) : (
                                'Role-Based Access Control (RBAC) Enforced'
                            )}
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#173B8F] to-[#0F2A66] hover:from-[#1E4CB8] hover:to-[#173B8F] shadow-md shadow-[#173B8F]/20 hover:shadow-lg transition-all active:scale-[0.99]"
                        >
                            <LogIn className="w-4 h-4" />
                            Log In
                        </Link>

                        <Link
                            href="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:border-slate-400 transition-all active:scale-[0.99]"
                        >
                            <UserPlus className="w-4 h-4" />
                            Create Account
                        </Link>
                    </div>

                    {/* Back navigation */}
                    <div className="flex items-center justify-center gap-3 text-xs text-slate-500 font-medium">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-1 hover:text-[#173B8F] hover:underline transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Return to Dashboard
                                </Link>
                                <span className="text-slate-300">&bull;</span>
                            </>
                        ) : null}

                        <Link
                            href="/"
                            className="hover:text-[#173B8F] hover:underline transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
