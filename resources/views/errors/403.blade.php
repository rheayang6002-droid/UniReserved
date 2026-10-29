<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>403 Forbidden — Access Restricted | {{ config('app.name', 'UniReserve') }}</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 50% 0%, #EEF2FF 0%, #F8FAFC 50%, #F1F5F9 100%);
            color: #0F172A;
            padding: 1.5rem;
            position: relative;
            overflow-x: hidden;
        }

        /* Ambient background glow orbs */
        .ambient-glow {
            position: absolute;
            border-radius: 9999px;
            filter: blur(80px);
            opacity: 0.45;
            pointer-events: none;
            z-index: 0;
        }

        .glow-1 {
            width: 480px;
            height: 480px;
            background: linear-gradient(135deg, #173B8F, #38BDF8);
            top: -100px;
            right: -100px;
            animation: floatSlow 12s ease-in-out infinite alternate;
        }

        .glow-2 {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #6366F1, #A855F7);
            bottom: -80px;
            left: -80px;
            animation: floatSlow 15s ease-in-out infinite alternate-reverse;
        }

        @keyframes floatSlow {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(30px, 40px) scale(1.08); }
        }

        /* Container & Card */
        .card-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 580px;
            margin: 0 auto;
        }

        .card {
            background: rgba(255, 255, 255, 0.94);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(226, 232, 240, 0.9);
            border-radius: 1.75rem;
            box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.12),
                        0 0 0 1px rgba(255, 255, 255, 0.6) inset;
            padding: 3rem 2.5rem;
            text-align: center;
            transition: transform 0.3s ease;
        }

        @media (max-width: 640px) {
            .card {
                padding: 2.25rem 1.5rem;
                border-radius: 1.25rem;
            }
        }

        /* Branding top header */
        .brand-header {
            display: inline-flex;
            align-items: center;
            gap: 0.625rem;
            padding: 0.375rem 0.875rem;
            background: #F1F5F9;
            border: 1px solid #E2E8F0;
            border-radius: 9999px;
            margin-bottom: 2rem;
        }

        .brand-dot {
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background: #EF4444;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(0.9); }
        }

        .brand-text {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #475569;
        }

        /* Illustration / Visual Icon */
        .illustration-wrapper {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto 1.75rem auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-ring {
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            border: 2px dashed #CBD5E1;
            animation: spinSlow 30s linear infinite;
        }

        @keyframes spinSlow {
            100% { transform: rotate(360deg); }
        }

        .icon-bg {
            width: 96px;
            height: 96px;
            border-radius: 1.5rem;
            background: linear-gradient(135deg, #173B8F 0%, #06142D 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 12px 24px -6px rgba(23, 59, 143, 0.4),
                        0 4px 8px -2px rgba(23, 59, 143, 0.2);
            position: relative;
            z-index: 2;
        }

        .icon-bg svg {
            width: 44px;
            height: 44px;
            color: #FFFFFF;
        }

        .floating-badge {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background: #EF4444;
            color: #FFFFFF;
            font-size: 0.6875rem;
            font-weight: 800;
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 3;
            letter-spacing: 0.05em;
        }

        /* Typography */
        .status-tag {
            display: inline-block;
            font-size: 0.8125rem;
            font-weight: 700;
            color: #173B8F;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }

        .title {
            font-size: 1.875rem;
            font-weight: 800;
            color: #06142D;
            line-height: 1.25;
            margin-bottom: 0.875rem;
            letter-spacing: -0.025em;
        }

        @media (max-width: 640px) {
            .title {
                font-size: 1.5rem;
            }
        }

        .description {
            font-size: 0.9375rem;
            line-height: 1.6;
            color: #64748B;
            margin-bottom: 1.75rem;
            max-width: 460px;
            margin-left: auto;
            margin-right: auto;
        }

        /* Security Info Banner */
        .security-badge {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 0.875rem;
            padding: 0.75rem 1rem;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.8125rem;
            color: #475569;
        }

        .security-badge svg {
            width: 16px;
            height: 16px;
            color: #173B8F;
            shrink: 0;
        }

        /* Action Buttons */
        .btn-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.75rem;
        }

        @media (min-width: 480px) {
            .btn-group {
                flex-direction: row;
                justify-content: center;
            }
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.8125rem 1.75rem;
            font-size: 0.9375rem;
            font-weight: 700;
            border-radius: 0.875rem;
            text-decoration: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            outline: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, #173B8F 0%, #0F2A66 100%);
            color: #FFFFFF;
            border: 1px solid transparent;
            box-shadow: 0 4px 12px rgba(23, 59, 143, 0.25);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #1E4CB8 0%, #173B8F 100%);
            box-shadow: 0 8px 20px rgba(23, 59, 143, 0.35);
            transform: translateY(-1px);
        }

        .btn-primary:active {
            transform: translateY(0);
        }

        .btn-secondary {
            background: #FFFFFF;
            color: #1E293B;
            border: 1px solid #CBD5E1;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .btn-secondary:hover {
            background: #F8FAFC;
            border-color: #94A3B8;
            color: #0F172A;
            transform: translateY(-1px);
        }

        .btn-secondary:active {
            transform: translateY(0);
        }

        /* Footer links */
        .footer-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.25rem;
            font-size: 0.8125rem;
            color: #64748B;
        }

        .footer-link {
            color: #64748B;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.15s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }

        .footer-link:hover {
            color: #173B8F;
            text-decoration: underline;
        }

        .divider-dot {
            width: 4px;
            height: 4px;
            border-radius: 9999px;
            background: #CBD5E1;
        }
    </style>
</head>
<body>
    <!-- Background glow shapes -->
    <div class="ambient-glow glow-1"></div>
    <div class="ambient-glow glow-2"></div>

    <div class="card-container">
        <main class="card">
            <!-- Security Badge Header -->
            <div class="brand-header">
                <span class="brand-dot"></span>
                <span class="brand-text">HTTP 403 &bull; Authorization Gate</span>
            </div>

            <!-- Lock / Shield Illustration -->
            <div class="illustration-wrapper">
                <div class="icon-ring"></div>
                <div class="icon-bg">
                    <!-- Shield with Keyhole Lock SVG -->
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <circle cx="12" cy="11" r="2"/>
                        <path d="M12 13v3"/>
                    </svg>
                </div>
                <span class="floating-badge">403</span>
            </div>

            <!-- Headings & Content -->
            <div class="status-tag">Access Restricted</div>
            <h1 class="title">You Don't Have Access</h1>
            <p class="description">
                You don't have permission to access this page. Please log in with an authorized account or create an account to continue.
            </p>

            <!-- Contextual Security Badge -->
            <div class="security-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>
                    @auth
                        Logged in as <strong>{{ auth()->user()->name }}</strong> (Role: {{ auth()->user()->role ?? (auth()->user()->roles->first()?->name ?? 'User') }})
                    @else
                        Role-Based Access Control (RBAC) Enforced
                    @endauth
                </span>
            </div>

            <!-- Login and Registration Action Buttons -->
            <div class="btn-group">
                <a href="{{ route('login') }}" class="btn btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Log In
                </a>

                @if (Route::has('register'))
                    <a href="{{ route('register') }}" class="btn btn-secondary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="20" y1="8" x2="20" y2="14"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        Create Account
                    </a>
                @endif
            </div>

            <!-- Back to Home / Dashboard Links -->
            <nav class="footer-nav" aria-label="Quick links">
                @auth
                    <a href="{{ route('dashboard') }}" class="footer-link">
                        &larr; Return to Dashboard
                    </a>
                    <span class="divider-dot"></span>
                @endauth

                <a href="{{ route('home') }}" class="footer-link">
                    Back to Home
                </a>
            </nav>
        </main>
    </div>
</body>
</html>
