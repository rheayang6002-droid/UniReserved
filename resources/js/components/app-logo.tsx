import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props as { name: string };

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center shrink-0">
                <img
                    src="/images/beo-logo.png"
                    alt="UniReserve BEO"
                    className="size-8 object-contain drop-shadow-sm"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.logo-fallback')) {
                            const span = document.createElement('span');
                            span.className = 'logo-fallback text-white text-xs font-bold tracking-tight bg-[#0B2568] p-1 rounded border border-[#800000]';
                            span.textContent = 'BEO';
                            parent.appendChild(span);
                        }
                    }}
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="truncate leading-tight font-black text-sidebar-foreground">
                        UNiReserve
                    </span>
                    <span className="px-1 py-0.2 bg-[#800000] text-[9px] font-bold text-white rounded">
                        BEO
                    </span>
                </div>
                <span className="truncate text-[11px] text-sidebar-foreground/80 leading-tight font-medium">
                    Business Enterprise Office
                </span>
                <span className="truncate text-[10px] text-sidebar-foreground/60 leading-tight">
                    Davao del Sur State College
                </span>
            </div>
        </>
    );
}
