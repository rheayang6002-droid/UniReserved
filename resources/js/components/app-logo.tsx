import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props as { name: string };

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-blue-700 overflow-hidden">
                <img
                    src="/images/school-logo.png"
                    alt="UniReserve"
                    className="size-6 object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.logo-fallback')) {
                            const span = document.createElement('span');
                            span.className = 'logo-fallback text-white text-xs font-bold';
                            span.textContent = 'UR';
                            parent.appendChild(span);
                        }
                    }}
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-sidebar-foreground">
                    UniReserve
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60 leading-tight">
                    DSSC Supply System
                </span>
            </div>
        </>
    );
}
