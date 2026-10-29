import { Head, Link, usePage } from '@inertiajs/react';
import { login, register } from '@/routes';
import { ArrowRight, LayoutDashboard, ShieldCheck, Clock, FileCheck2 } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    return (
        <>
            <Head title="UniReserve — School Uniform & Supplies Reservation System" />
            <div className="min-h-screen bg-[#06142D] text-white flex flex-col justify-between selection:bg-[#123B8F] selection:text-white">
                {/* DSSC Royal Blue + BEO Maroon Brand Accent Bar */}
                <div className="h-1 bg-gradient-to-r from-[#123B8F] via-[#123B8F] to-[#641522]" />

                {/* Header / Navbar */}
                <header className="border-b border-white/10 backdrop-blur-md bg-[#06142D]/95 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
                            {/* Left: [Official DSSC Logo] UniReserve [DSSC-BEO] + Subtitle */}
                            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                                <img
                                    src="/images/school-logo.png"
                                    alt="DSSC Official Seal"
                                    className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0 rounded-full bg-white/5 p-0.5 border border-white/10"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight">
                                            UniReserve
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#641522] text-rose-100 border border-[#8D1E32]/50">
                                            DSSC-BEO
                                        </span>
                                    </div>
                                    <div className="text-[11px] sm:text-xs text-[#AAB8D0] font-medium leading-tight truncate">
                                        Business Enterprise Office • Supply &amp; Uniforms
                                    </div>
                                </div>
                            </div>

                            {/* Right: Auth navigation */}
                            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                                {user ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 text-xs sm:text-sm bg-[#123B8F] hover:bg-[#0e2f73] text-white rounded-lg transition-all font-semibold shadow-sm border border-blue-400/20 flex items-center gap-1.5"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#AAB8D0] hover:text-white transition-colors"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm bg-[#123B8F] hover:bg-[#0e2f73] text-white rounded-lg transition-all font-semibold shadow-sm border border-blue-400/20"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Landing Page Hero */}
                <main className="flex-1">
                    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
                        {/* Subtle background ambient lights */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#123B8F]/15 rounded-full blur-3xl" />
                            <div className="absolute top-1/2 -left-32 w-72 h-72 bg-[#641522]/10 rounded-full blur-3xl" />
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                                {/* Left Side: Branding, Headline, Description, CTAs, Indicators */}
                                <div className="lg:col-span-6 space-y-6">
                                    {/* Announcement Badge */}
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#123B8F]/15 border border-[#123B8F]/35 rounded-full text-xs font-semibold text-blue-200">
                                        <span className="w-2 h-2 bg-[#D99A18] rounded-full animate-pulse" />
                                        <span>DSSC Official Portal • First Semester Reservations Open</span>
                                    </div>

                                    {/* Main Headline */}
                                    <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.12] tracking-tight">
                                        Reserve Your School{' '}
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-sky-200 to-white">
                                            Uniforms Online
                                        </span>
                                    </h1>

                                    {/* Supporting Text */}
                                    <p className="text-sm sm:text-base lg:text-lg text-[#AAB8D0] leading-relaxed max-w-xl">
                                        Skip the long lines on campus. Reserve your DSSC school uniforms, PATH-Fit attire, and ID laces online with an automated First-Come, First-Served queue ticket.
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-wrap items-center gap-3.5 pt-1">
                                        {user ? (
                                            <>
                                                <Link
                                                    href="/reservations/create"
                                                    className="px-6 py-3.5 bg-[#123B8F] hover:bg-[#0e2f73] text-white rounded-xl font-semibold transition-all shadow-md shadow-[#06142D]/60 hover:-translate-y-0.5 flex items-center gap-2 text-sm sm:text-base border border-blue-400/20"
                                                >
                                                    <span>Reserve Uniforms Now</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href="/dashboard"
                                                    className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl font-semibold transition-all backdrop-blur-sm text-sm sm:text-base flex items-center gap-2"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    <span>Go to Dashboard</span>
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href={register()}
                                                    className="px-6 py-3.5 bg-[#123B8F] hover:bg-[#0e2f73] text-white rounded-xl font-semibold transition-all shadow-md shadow-[#06142D]/60 hover:-translate-y-0.5 flex items-center gap-2 text-sm sm:text-base border border-blue-400/20"
                                                >
                                                    <span>Reserve Uniforms Now</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={login()}
                                                    className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl font-semibold transition-all backdrop-blur-sm text-sm sm:text-base"
                                                >
                                                    Student Sign In
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    {/* Trust / Value Indicators */}
                                    <div className="pt-6 border-t border-white/10">
                                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-white font-bold text-sm sm:text-base">
                                                    <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 hidden sm:inline-block" />
                                                    <span>100% FCFS</span>
                                                </div>
                                                <div className="text-[#AAB8D0] text-[11px] sm:text-xs mt-0.5 leading-snug">
                                                    Fair Queue Order
                                                </div>
                                            </div>

                                            <div className="flex flex-col border-l border-white/10 pl-3 sm:pl-4">
                                                <div className="flex items-center gap-1.5 text-white font-bold text-sm sm:text-base">
                                                    <Clock className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:inline-block" />
                                                    <span>Live Stocks</span>
                                                </div>
                                                <div className="text-[#AAB8D0] text-[11px] sm:text-xs mt-0.5 leading-snug">
                                                    Real-time Sizing
                                                </div>
                                            </div>

                                            <div className="flex flex-col border-l border-white/10 pl-3 sm:pl-4">
                                                <div className="flex items-center gap-1.5 text-white font-bold text-sm sm:text-base">
                                                    <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0 hidden sm:inline-block" />
                                                    <span>Instant Slip</span>
                                                </div>
                                                <div className="text-[#AAB8D0] text-[11px] sm:text-xs mt-0.5 leading-snug">
                                                    Official Pickup Pass
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Hero Product Preview (2x2 Grid) */}
                                <div className="lg:col-span-6">
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        {[
                                            {
                                                name: "Men's Uniform Shirt",
                                                tag: 'School Uniform',
                                                price: '₱350.00',
                                                stock: '131 avail.',
                                                img: '/images/products/mens-uniform-shirt.jpg',
                                            },
                                            {
                                                name: "Women's Uniform Blouse",
                                                tag: 'School Uniform',
                                                price: '₱350.00',
                                                stock: '120 avail.',
                                                img: '/images/products/womens-uniform-blouse.jpg',
                                            },
                                            {
                                                name: 'PATH-Fit Shirt',
                                                tag: 'PATH-Fit',
                                                price: '₱320.00',
                                                stock: '112 avail.',
                                                img: '/images/products/path-fit-shirt.jpg',
                                            },
                                            {
                                                name: 'DSSC ID Lace',
                                                tag: 'Accessories',
                                                price: '₱85.00',
                                                stock: '125 avail.',
                                                img: '/images/products/dssc-id-lace.jpg',
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.name}
                                                className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200/90 flex flex-col justify-between text-slate-900 group hover:shadow-md transition-shadow"
                                            >
                                                {/* Consistent Image Container */}
                                                <div className="aspect-[4/3] rounded-lg bg-[#F7F8FA] flex items-center justify-center p-2.5 mb-3 overflow-hidden border border-slate-100">
                                                    <img
                                                        src={item.img}
                                                        alt={item.name}
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>

                                                {/* Catalog Information */}
                                                <div className="space-y-1.5">
                                                    <div>
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#06142D] text-slate-100 tracking-wide">
                                                            {item.tag}
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-1">
                                                        {item.name}
                                                    </div>
                                                    <div className="flex items-center justify-between pt-0.5">
                                                        <span className="font-bold text-sm sm:text-base text-[#123B8F]">
                                                            {item.price}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                            {item.stock}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Process Steps */}
                    <section className="border-t border-white/10 bg-white/[0.015] py-14 sm:py-18">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-10 sm:mb-12">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    4 Easy Steps to Get Your Supplies
                                </h2>
                                <p className="text-sm text-[#AAB8D0] mt-1.5 max-w-lg mx-auto">
                                    Transparent and convenient school reservation process managed by BEO
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    {
                                        step: '01',
                                        title: 'Sign In / Register',
                                        desc: 'Use your student ID and school email to access your account.',
                                    },
                                    {
                                        step: '02',
                                        title: 'Browse & Choose Sizes',
                                        desc: 'Select shirts, pants, skirts, or ID laces with live stock data.',
                                    },
                                    {
                                        step: '03',
                                        title: 'Get Queue Number',
                                        desc: 'Receive your FCFS priority ticket upon reservation submission.',
                                    },
                                    {
                                        step: '04',
                                        title: 'Pay & Claim',
                                        desc: 'Pay at the campus cashier and claim your uniforms smoothly.',
                                    },
                                ].map((s) => (
                                    <div
                                        key={s.step}
                                        className="bg-white/[0.025] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
                                    >
                                        <div className="text-2xl sm:text-3xl font-black text-[#123B8F]/70 font-mono mb-2">
                                            {s.step}
                                        </div>
                                        <div className="font-semibold text-sm sm:text-base text-white mb-1.5">
                                            {s.title}
                                        </div>
                                        <p className="text-xs text-[#AAB8D0] leading-relaxed">
                                            {s.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/10 py-6 sm:py-8 bg-[#040E20]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#AAB8D0]">
                        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                            <img
                                src="/images/school-logo.png"
                                alt="DSSC"
                                className="h-5 w-5 object-contain rounded-full opacity-80"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span>
                                UniReserve • Managed by the Business Enterprise Office (BEO) for Davao del Sur State College
                            </span>
                        </div>
                        <span className="text-[#AAB8D0]/80">
                            &copy; {new Date().getFullYear()} UniReserve. All rights reserved.
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}

