export default function AppLogo() {
    return (
        <>
            <img
                src="/images/bugo-health-center-logo-1.png"
                alt="Barangay Bugo Health Center"
                className="size-8 rounded-md object-contain"
            />

            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">
                    Barangay Bugo
                </span>

                <span className="truncate text-xs text-muted-foreground">
                    Health Center
                </span>
            </div>
        </>
    );
}