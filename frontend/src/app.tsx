import './app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Barangay Bugo Immunization Management System';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#10b981',
    },
});

initializeTheme();

// Enable clicking anywhere inside date/time inputs to open the picker
if (typeof window !== 'undefined') {
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (
            target instanceof HTMLInputElement &&
            (target.type === 'date' || target.type === 'time' || target.type === 'datetime-local') &&
            !target.disabled &&
            !target.readOnly
        ) {
            try {
                target.showPicker?.();
            } catch {
                // Ignore if unsupported or already open
            }
        }
    });
}
