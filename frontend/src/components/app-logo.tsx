export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5 overflow-hidden">
            <img
                src="/images/bugo-health-center-logo.png"
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-sidebar-border"
                onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                }}
            />

            <div className="grid flex-1 text-left leading-tight min-w-0">
                <span className="truncate text-sm font-bold text-sidebar-foreground">
                    Barangay Bugo
                </span>
                <span className="truncate text-[11px] font-medium text-sidebar-foreground/70">
                    Health Center
                </span>
            </div>
        </div>
    );
}