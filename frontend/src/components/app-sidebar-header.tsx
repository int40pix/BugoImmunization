import { Breadcrumbs } from '@/components/breadcrumbs';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { TopNavUser } from '@/components/top-nav-user';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { QrCode } from 'lucide-react';
import { useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [scannerOpen, setScannerOpen] = useState(false);

    return (
        <header className="border-sidebar-border/60 sticky top-0 z-20 flex h-16 shrink-0 items-center border-b bg-background/90 px-3 sm:px-6 md:px-8 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 w-full max-w-full">
            <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-2 sm:gap-4 min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                    <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground shrink-0" />
                    {breadcrumbs.length > 0 && (
                        <div className="hidden md:flex d-none d-md-flex items-center gap-2.5 min-w-0">
                            <div className="h-4 w-px bg-border/60 shrink-0" />
                            <div className="truncate">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setScannerOpen(true)}
                        className="h-8 gap-1.5 rounded-lg border-border/80 px-2 sm:px-2.5 text-xs font-medium text-foreground shadow-2xs hover:bg-muted shrink-0"
                        title="Scan Patient or Vaccine QR Code"
                    >
                        <QrCode className="h-3.5 w-3.5 text-primary" />
                        <span className="hidden sm:inline">Scan QR</span>
                    </Button>
                    <TopNavUser />
                </div>
            </div>

            <QrScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
        </header>
    );
}

