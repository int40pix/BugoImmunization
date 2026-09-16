import { Head, Link, useForm } from '@inertiajs/react';
import {
    HeartPulse,
    LockKeyhole,
    LogIn,
    ShieldCheck,
    UsersRound,
} from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;

    [key: string]: string | boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({
    status,
    canResetPassword,
}: LoginProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => {
                reset('password');
            },
        });
    };

    return (
        <>
            <Head title="Sign In" />

            <div className="min-h-screen bg-muted/30">
                <div className="grid min-h-screen lg:grid-cols-2">
                    {/* Left Side */}
                    <div className="hidden border-r bg-background lg:flex lg:justify-center lg:p-12">
                        <div className="flex h-full w-full max-w-lg flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/images/bugo-health-center-logo.png"
                                        alt="Barangay Bugo Health Center"
                                        className="h-14 w-14 rounded-full object-contain"
                                    />

                                    <div>
                                        <p className="font-semibold">
                                            Barangay Bugo Health Center
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            Pediatric Immunization Management System
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="my-auto py-8">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/30">
                                    <HeartPulse className="h-7 w-7" />
                                </div>

                                <h1 className="text-4xl font-bold tracking-tight">
                                    One secure portal for
                                    health center staff and
                                    families.
                                </h1>

                                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                                    Access immunization records,
                                    vaccination schedules,
                                    patient information, and
                                    health center services using
                                    your registered account.
                                </p>

                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border p-4">
                                        <ShieldCheck className="mb-3 h-5 w-5" />

                                        <p className="font-medium">
                                            Health Center Staff
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Admin, nurse, midwife,
                                            and barangay health
                                            worker accounts.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border p-4">
                                        <UsersRound className="mb-3 h-5 w-5" />

                                        <p className="font-medium">
                                            Parents & Guardians
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            View children's
                                            immunization records
                                            and schedules.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Barangay Bugo Health Center
                            </p>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center justify-center px-5 py-10 sm:px-8">
                        <div className="w-full max-w-md">
                            {/* Mobile Header */}
                            <div className="mb-8 text-center lg:hidden">
                                <img
                                    src="/images/bugo-health-center-logo.png"
                                    alt="Barangay Bugo Health Center"
                                    className="mx-auto h-20 w-20 rounded-full object-contain"
                                />

                                <p className="mt-4 font-semibold">
                                    Barangay Bugo Health Center
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pediatric Immunization Management System
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
                                <div className="mb-7">
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/30">
                                        <LockKeyhole className="h-5 w-5" />
                                    </div>

                                    <h2 className="text-2xl font-bold tracking-tight">
                                        Sign in to your account
                                    </h2>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Staff members, parents,
                                        and guardians use this
                                        same login page.
                                    </p>
                                </div>

                                {status && (
                                    <div className="mb-5 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                                        {status}
                                    </div>
                                )}

                                <form
                                    onSubmit={submit}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            autoComplete="email"
                                            autoFocus
                                            placeholder="Enter your email"
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <InputError
                                            message={errors.email}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <Label htmlFor="password">
                                                Password
                                            </Label>

                                            {canResetPassword && (
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm font-medium underline underline-offset-4"
                                                >
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            onChange={(event) =>
                                                setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <InputError
                                            message={errors.password}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="remember"
                                                checked={data.remember}
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'remember',
                                                        checked === true,
                                                    )
                                                }
                                            />

                                            <Label
                                                htmlFor="remember"
                                                className="cursor-pointer font-normal"
                                            >
                                                Remember me
                                            </Label>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        <LogIn className="mr-2 h-4 w-4" />

                                        {processing
                                            ? 'Signing in...'
                                            : 'Sign In'}
                                    </Button>
                                </form>

                                <div className="mt-6 border-t pt-5">
                                    <p className="text-center text-xs leading-relaxed text-muted-foreground">
                                        Parents or guardians
                                        using a temporary
                                        password will be asked
                                        to create a new password
                                        after signing in.
                                    </p>
                                </div>
                            </div>

                            <p className="mt-6 text-center text-xs text-muted-foreground">
                                Need account assistance?
                                Contact Barangay Bugo Health Center.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}