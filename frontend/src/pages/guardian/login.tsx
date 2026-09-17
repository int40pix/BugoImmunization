import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    ShieldCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type GuardianLoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function GuardianLogin() {
    const [showPassword, setShowPassword] =
        useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<GuardianLoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        post('/guardian/login');
    };

    return (
        <>
            <Head title="Guardian Login" />

            <div className="relative min-h-screen bg-background text-foreground">
                <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
                    <Button
                        type="button"
                        variant="ghost"
                        asChild
                    >
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to portal selection
                        </Link>
                    </Button>
                </div>

                <div className="container min-h-screen d-flex align-items-center justify-content-center py-5">
                    <div className="row justify-content-center w-100">
                        <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
                        <div className="mb-8 text-center">
                            <img
                                src="/images/bugo-health-center-logo.png"
                                alt="Barangay Bugo Health Center"
                                className="mx-auto h-16 w-16 rounded-full object-contain"
                            />

                            <p className="mt-4 text-sm font-medium text-muted-foreground">
                                Barangay Bugo Health Center
                            </p>

                            <h1 className="mt-2 text-2xl font-bold">
                                Guardian Portal
                            </h1>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Sign in to view your children's
                                immunization records and
                                appointments.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-card p-6 shadow-sm">
                            <div className="mb-6 flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

                                <div>
                                    <p className="font-semibold">
                                        Parent / Guardian Access
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Use the email and password
                                        provided during family
                                        registration.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={submit}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        autoFocus
                                        value={data.email}
                                        onChange={(event) =>
                                            setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password
                                    </Label>

                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(event) =>
                                                setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                            className="pr-11"
                                        />

                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword,
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <p className="text-sm text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <label className="flex items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(event) =>
                                            setData(
                                                'remember',
                                                event.target.checked,
                                            )
                                        }
                                    />

                                    Remember me
                                </label>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Signing in...'
                                        : 'Log in'}
                                </Button>
                            </form>
                        </div>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Health center staff?{' '}
                            <Link
                                href="/login"
                                className="font-medium text-foreground underline underline-offset-4"
                            >
                                Staff login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </>
);
}