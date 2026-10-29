import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

function showFlash(flash: { success?: string | null; error?: string | null } | undefined | null) {
    if (!flash) return;
    if (flash.success) {
        toast.success(flash.success, { duration: 4000 });
    }
    if (flash.error) {
        toast.error(flash.error, { duration: 5000 });
    }
}

export function useFlashToast(): void {
    useEffect(() => {
        // Initial page load flash check
        try {
            const scriptEl = document.querySelector('script[data-page="app"]');
            if (scriptEl?.textContent) {
                const initial = JSON.parse(scriptEl.textContent);
                showFlash(initial?.props?.flash);
            } else {
                const appEl = document.getElementById('app');
                if (appEl?.dataset?.page) {
                    const initial = JSON.parse(appEl.dataset.page);
                    showFlash(initial?.props?.flash);
                }
            }
        } catch {
            // Ignore parse errors
        }

        // Subsequent Inertia page navigations
        return router.on('navigate', (event: any) => {
            try {
                const flash = event?.detail?.page?.props?.flash;
                showFlash(flash);
            } catch {
                // Ignore
            }
        });
    }, []);
}

