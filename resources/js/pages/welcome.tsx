import { Head, Link } from '@inertiajs/react';
import { login, register } from '@/routes';
import { ShoppingBag, ArrowRight, ShieldCheck, Clock, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

export default function Welcome() {
    return (
        <>
            <Head title="UniReserve — School Uniform & Supplies Reservation System" />
            <div className="min-h-screen bg-[#061226] text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
                {/* Navigation */}
                <nav className="border-b border-white/10 backdrop-blur-md bg-[#061226]/80 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/school-logo.png"
                                    alt="DSSC Logo"
                                    className="h-10 w-10 object-contain drop-shadow-sm"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <div>
                                    <div className="font-extrabold text-lg leading-tight tracking-tight text-white">
                                        UniReserve
                                    </div>
                                    <div className="text-[11px] text-blue-200/80 font-medium leading-tight">
                                        DSSC Supply & Uniform System
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href={login()}
                                    className="px-4 py-2 text-sm font-semibold text-blue-100 hover:text-white transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href={register()}
                                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold shadow-md shadow-blue-950/50"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-16 sm:py-24">
                    {/* Midnight Blue glow accents */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                            {/* Left Text */}
                            <div className="lg:col-span-6 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full text-xs font-semibold text-blue-300">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    First Semester Reservations Open
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                                    Reserve Your{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-200 to-white">
                                        School Uniforms
                                    </span>{' '}
                                    Online
                                </h1>

                                <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed max-w-lg">
                                    Skip the long lines on campus. Reserve your DSSC school uniforms, PATH-Fit attire, and ID laces online with an automated First-Come, First-Served queue ticket.
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <Link
                                        href={register()}
                                        className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 hover:-translate-y-0.5 flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        Reserve Uniforms Now
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={login()}
                                        className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition-all backdrop-blur-sm text-sm sm:text-base"
                                    >
                                        Student Sign In
                                    </Link>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs sm:text-sm">
                                    <div>
                                        <div className="font-extrabold text-white text-lg sm:text-xl font-mono">100% FCFS</div>
                                        <div className="text-blue-200/70 text-[11px] sm:text-xs mt-0.5">Fair Queue Order</div>
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-white text-lg sm:text-xl font-mono">Live Stocks</div>
                                        <div className="text-blue-200/70 text-[11px] sm:text-xs mt-0.5">Real-time Sizing</div>
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-white text-lg sm:text-xl font-mono">Instant Slip</div>
                                        <div className="text-blue-200/70 text-[11px] sm:text-xs mt-0.5">Official Pickup Pass</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Preview Grid showing Real Catalog Items */}
                            <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
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
                                        className="bg-white rounded-2xl p-3.5 shadow-md flex flex-col justify-between text-gray-900 group hover:-translate-y-1 transition-all border border-gray-100"
                                    >
                                        <div className="aspect-[4/3] rounded-xl bg-[#f5f8fc] flex items-center justify-center p-2 mb-2.5 overflow-hidden">
                                            <img
                                                src={item.img}
                                                alt={item.name}
                                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B2356] text-white">
                                                {item.tag}
                                            </span>
                                            <div className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">
                                                {item.name}
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="font-black text-[#0B3A92] text-sm font-sans">
                                                    {item.price}
                                                </span>
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                                    {item.stock}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Process Steps */}
                <section className="border-t border-white/10 bg-white/[0.02] py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                                4 Easy Steps to Get Your Supplies
                            </h2>
                            <p className="text-blue-200/70 text-sm mt-1">
                                Transparent and convenient school reservation process
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { step: '01', title: 'Sign In / Register', desc: 'Use your student ID and school email to create an account.' },
                                { step: '02', title: 'Browse & Choose Sizes', desc: 'Select shirts, pants, skirts, or ID laces with live stock data.' },
                                { step: '03', title: 'Get Queue Number', desc: 'Receive your FCFS priority ticket upon admin verification.' },
                                { step: '04', title: 'Pay & Claim', desc: 'Pay at the campus cashier and claim your uniforms seamlessly.' },
                            ].map((s) => (
                                <div
                                    key={s.step}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="text-3xl font-black text-blue-400/40 font-mono mb-2">
                                        {s.step}
                                    </div>
                                    <div className="font-bold text-sm sm:text-base text-white mb-1">
                                        {s.title}
                                    </div>
                                    <p className="text-xs text-blue-200/70 leading-relaxed">
                                        {s.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/10 py-6 bg-[#040c1a]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/50">
                        <div className="flex items-center gap-2">
                            <img
                                src="/images/school-logo.png"
                                alt="DSSC"
                                className="h-6 w-6 object-contain opacity-70"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span>UniReserve — Davao del Sur State College (DSSC)</span>
                        </div>
                        <span>© {new Date().getFullYear()} All rights reserved.</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
