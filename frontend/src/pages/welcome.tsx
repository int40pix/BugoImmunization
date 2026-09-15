import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    HeartPulse,
    LogIn,
    ShieldCheck,
    UsersRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function Welcome() {
    return (
        <>
            <Head title="Barangay Bugo Health Center" />

            <div className="min-h-screen bg-background text-foreground">
                <div className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-10">
                    <div className="w-full">
                        {/* Header */}
                        <div className="mx-auto mb-10 max-w-2xl text-center">
                            <img
                                src="/images/bugo-health-center-logo.png"
                                alt="Barangay Bugo Health Center"
                                className="mx-auto h-20 w-20 rounded-full object-contain"
                            />

                            <p className="mt-5 text-sm font-medium text-muted-foreground">
                                Barangay Bugo Health Center
                            </p>

                            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                                Pediatric Immunization
                                Management System
                            </h1>

                            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                                Secure access for health
                                center staff, parents, and
                                guardians.
                            </p>
                        </div>

                        {/* Unified Login */}
                        <div className="mx-auto max-w-xl">
                            <Card>
                                <CardHeader>
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border bg-muted/30">
                                        <LogIn className="h-7 w-7" />
                                    </div>

                                    <CardTitle className="text-center text-2xl">
                                        Sign In
                                    </CardTitle>

                                    <p className="text-center text-sm text-muted-foreground">
                                        Staff members, parents,
                                        and guardians use the
                                        same secure login page.
                                    </p>
                                </CardHeader>

                                <CardContent>
                                    <Button
                                        asChild
                                        className="w-full"
                                    >
                                        <Link href="/login">
                                            Continue to Login

                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Account Types */}
                        <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/30">
                                        <UsersRound className="h-5 w-5" />
                                    </div>

                                    <CardTitle>
                                        Parent / Guardian
                                    </CardTitle>

                                    <p className="text-sm text-muted-foreground">
                                        View your registered
                                        children's immunization
                                        information and upcoming
                                        vaccination schedules.
                                    </p>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/30">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>

                                    <CardTitle>
                                        Health Center Staff
                                    </CardTitle>

                                    <p className="text-sm text-muted-foreground">
                                        Manage patients,
                                        immunization records,
                                        guardian accounts,
                                        vaccines, and inventory.
                                    </p>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Information */}
                        <div className="mx-auto mt-8 flex max-w-4xl items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                            <HeartPulse className="mt-0.5 h-5 w-5 shrink-0" />

                            <p>
                                Children do not have
                                individual login accounts.
                                Their records are linked to
                                their registered parent or
                                guardian.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}