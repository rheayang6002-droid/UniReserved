
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log In — UniReserve" />

            {/* Full-screen split layout */}
            <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">

                {/* ============================================================ */}
                {/* LEFT PANEL — BEO Branding (50%)                              */}
                {/* ============================================================ */}
                <div className="relative w-full lg:w-1/2 min-h-[440px] lg:min-h-screen flex flex-col items-center justify-center overflow-hidden">

                    {/* Background: school building image with deep blue overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/images/school-logo.jpg')" }}
                    />
                    {/* Deep blue gradient overlay on top of building image */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(160deg, rgba(14,33,98,0.90) 0%, rgba(22,48,140,0.85) 40%, rgba(80,20,55,0.82) 100%)',
                        }}
                    />

                    {/* Bottom decorative wave / swoosh */}
                    <svg
                        className="absolute bottom-0 left-0 w-full pointer-events-none"
                        viewBox="0 0 600 90"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0,60 C150,100 350,20 600,65 L600,90 L0,90 Z"
                            fill="rgba(127,29,58,0.55)"
                        />
                        <path
                            d="M0,70 C180,30 400,90 600,50 L600,90 L0,90 Z"
                            fill="rgba(91,20,40,0.40)"
                        />
                    </svg>

                    {/* Branding content */}
                    <div className="relative z-10 flex flex-col items-center text-center px-8 py-14 gap-5">
                        {/* BEO Logo — Dominant visual */}
                        <div
                            className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 select-none"
                            style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.45))' }}
                        >
                            <img
                                src="/images/beo-logo.png"
                                alt="Business Enterprise Office — Income Generating Project"
                                className="w-full h-full object-contain"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>

                        {/* Institutional text */}
                        <div className="space-y-1.5 mt-1">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-widest text-white uppercase drop-shadow">
                                Davao Del Sur State College
                            </h2>
                            <p className="text-sm sm:text-base text-white/80 italic font-medium">
                                Quality Education for a Progressive Tomorrow
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* RIGHT PANEL — Login Form (50%)                               */}
                {/* ============================================================ */}
                <div className="relative w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-16 overflow-hidden">

                    {/* Decorative top-right pink/maroon swoosh */}
                    <svg
                        className="absolute top-0 right-0 w-56 sm:w-72 pointer-events-none"
                        viewBox="0 0 300 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <ellipse
                            cx="260"
                            cy="-20"
                            rx="160"
                            ry="130"
                            fill="rgba(220,120,140,0.18)"
                        />
                        <ellipse
                            cx="290"
                            cy="20"
                            rx="120"
                            ry="90"
                            fill="rgba(127,29,58,0.10)"
                        />
                    </svg>

                    {/* Decorative bottom-right subtle maroon swoosh */}
                    <svg
                        className="absolute bottom-0 right-0 w-48 pointer-events-none"
                        viewBox="0 0 250 160"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <ellipse
                            cx="220"
                            cy="140"
                            rx="140"
                            ry="80"
                            fill="rgba(127,29,58,0.07)"
                        />
                    </svg>

                    {/* Login container */}
                    <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center gap-6">

                        {/* UNiReserve brand header */}
                        <div className="text-center">
                            {/* Graduation cap + wordmark */}
                            <div className="flex items-center justify-center gap-2 mb-1">
                                {/* Graduation cap SVG */}
                                <svg
                                    className="w-10 h-10 shrink-0"
                                    viewBox="0 0 48 36"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    {/* Cap top / board */}
                                    <polygon
                                        points="24,2 2,14 24,24 46,14"
                                        fill="#1E3A8A"
                                    />
                                    {/* Right side flap (maroon) */}
                                    <polygon
                                        points="24,24 46,14 46,26 24,34"
                                        fill="#7F1D3A"
                                        opacity="0.85"
                                    />
                                    {/* Left side flap */}
                                    <polygon
                                        points="24,24 2,14 2,26 24,34"
                                        fill="#1E3A8A"
                                        opacity="0.75"
                                    />
                                    {/* Tassel string */}
                                    <line
                                        x1="44"
                                        y1="14"
                                        x2="44"
                                        y2="28"
                                        stroke="#7F1D3A"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                    {/* Tassel ball */}
                                    <circle cx="44" cy="29.5" r="2.2" fill="#7F1D3A" />
                                </svg>

                                <div className="text-4xl font-extrabold tracking-tight leading-none">
                                    <span className="text-[#1E3A8A]">UNI</span>
                                    <span className="text-[#7F1D3A]">Reserve</span>
                                </div>
                            </div>

                            {/* Tagline */}
                            <p className="text-xs font-semibold text-slate-400 tracking-[0.18em] uppercase">
                                Reserve&nbsp;•&nbsp;Manage&nbsp;•&nbsp;Succeed
                            </p>
                        </div>

                        {/* Welcome heading */}
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Welcome Back!
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Sign in to your account to continue
                            </p>
                        </div>

                        {/* Status message */}
                        {status && (
                            <div className="w-full text-center text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                                {status}
                            </div>
                        )}

                        {/* Optional passkey */}
                        <div className="w-full">
                            <PasskeyVerify />
                        </div>

                        {/* Form card — white, rounded, soft shadow */}
                        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/60 px-6 py-7 flex flex-col gap-5">
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="flex flex-col gap-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Email / Student ID */}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
                                                    <Mail className="w-4 h-4" />
                                                </span>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="Email or Student ID"
                                                    className="pl-10 h-11 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:border-[#1E3A8A] focus-visible:ring-[#1E3A8A]/20 text-sm"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Password */}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none z-10">
                                                    <Lock className="w-4 h-4" />
                                                </span>
                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Password"
                                                    className="pl-10 h-11 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:border-[#1E3A8A] focus-visible:ring-[#1E3A8A]/20 text-sm"
                                                />
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        {/* Remember me + Forgot password */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                    className="border-slate-300 data-[state=checked]:bg-[#1E3A8A] data-[state=checked]:border-[#1E3A8A] rounded"
                                                />
                                                <Label
                                                    htmlFor="remember"
                                                    className="text-sm text-slate-600 font-normal cursor-pointer select-none"
                                                >
                                                    Remember me
                                                </Label>
                                            </div>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-sm font-semibold text-[#1E3A8A] hover:text-[#7F1D3A] transition-colors"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>

                                        {/* Log In button */}
                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-white font-bold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.99] shadow-md cursor-pointer flex items-center justify-center gap-2 group border-0"
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, #1E3A8A 0%, #7F1D3A 100%)',
                                            }}
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner className="w-4 h-4 text-white" />}
                                            <span>{processing ? 'Signing In...' : 'Log In'}</span>
                                            {!processing && (
                                                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                            )}
                                        </Button>

                                        {/* Divider */}
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-slate-200" />
                                            </div>
                                            <div className="relative flex justify-center">
                                                <span className="px-4 bg-white text-xs text-slate-400 font-medium">
                                                    or
                                                </span>
                                            </div>
                                        </div>

                                        {/* Create New Account */}
                                        <Link
                                            href={register()}
                                            tabIndex={6}
                                            className="inline-flex items-center justify-center w-full h-11 px-4 text-sm font-semibold text-[#1E3A8A] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all gap-2 shadow-xs"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Create New Account</span>
                                        </Link>
                                    </>
                                )}
                            </Form>
                        </div>

                        {/* Security message */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                                <span>Your information is secure and protected.</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Only authorized users can access the system.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Login.layout = null;
