import { Head, useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    ShieldCheck,
} from 'lucide-react';
import {
    FormEventHandler,
    useState,
} from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasswordForm {
    password: string;
    password_confirmation: string;

    [key: string]: string;
}

export default function ChangeTemporaryPassword() {
    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showConfirmation,
        setShowConfirmation,
    ] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<PasswordForm>({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (
        event
    ) => {
        event.preventDefault();

        post(
            '/change-temporary-password',
            {
                preserveScroll: true,

                onFinish: () => {
                    reset(
                        'password',
                        'password_confirmation'
                    );
                },
            }
        );
    };

    return (
        <>
            <Head title="Create New Password" />

            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-10">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
                        <div className="mb-7">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/30">
                                <KeyRound className="h-5 w-5" />
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight">
                                Create your new password
                            </h1>

                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                You signed in using a temporary password.
                                Before continuing to the Guardian Portal,
                                create a password that only you know.
                            </p>
                        </div>

                        <div className="mb-6 rounded-xl border bg-muted/20 p-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                                <div>
                                    <p className="text-sm font-medium">
                                        First-time account setup
                                    </p>

                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        After you save your new password,
                                        the temporary password will no longer work.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    New Password
                                </Label>

                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={
                                            data.password
                                        }
                                        autoComplete="new-password"
                                        autoFocus
                                        placeholder="Enter a new password"
                                        className="pr-11"
                                        onChange={(
                                            event
                                        ) =>
                                            setData(
                                                'password',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (
                                                    current
                                                ) =>
                                                    !current
                                            )
                                        }
                                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
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

                                <InputError
                                    message={
                                        errors.password
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm New Password
                                </Label>

                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={
                                            showConfirmation
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={
                                            data
                                                .password_confirmation
                                        }
                                        autoComplete="new-password"
                                        placeholder="Re-enter your new password"
                                        className="pr-11"
                                        onChange={(
                                            event
                                        ) =>
                                            setData(
                                                'password_confirmation',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmation(
                                                (
                                                    current
                                                ) =>
                                                    !current
                                            )
                                        }
                                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                                        aria-label={
                                            showConfirmation
                                                ? 'Hide password confirmation'
                                                : 'Show password confirmation'
                                        }
                                    >
                                        {showConfirmation ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
                                Use at least 8 characters.
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    processing
                                }
                            >
                                <LockKeyhole className="mr-2 h-4 w-4" />

                                {processing
                                    ? 'Creating Password...'
                                    : 'Create Password & Continue'}
                            </Button>
                        </form>
                    </div>

                    <p className="mt-5 text-center text-xs text-muted-foreground">
                        Barangay Bugo Health Center · Pediatric Immunization
                        Management System
                    </p>
                </div>
            </div>
        </>
    );
}
