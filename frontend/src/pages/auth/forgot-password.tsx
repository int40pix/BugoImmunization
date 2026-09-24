import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Info, KeyRound } from 'lucide-react';
import { type FormEventHandler } from 'react';

interface ForgotPasswordForm {
    email: string;
    [key: string]: string;
}

interface PageProps {
    status?: string;
    [key: string]: unknown;
}

export default function ForgotPassword() {
    const { status } = usePage<PageProps>().props;

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<ForgotPasswordForm>({
        email: '',
    });

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        post('/forgot-password');
    };

    return (
        <AuthLayout
            title={status ? 'Recovery Request Sent' : 'Forgot password?'}
            description={
                status
                    ? 'Your password recovery request has been logged into the system.'
                    : 'Submit a password recovery request for your staff or guardian account.'
            }
        >
            <Head title="Forgot Password" />

            {status ? (
                <div className="space-y-6">
                    <Alert className="border-sky-500/30 bg-sky-50/70 text-foreground dark:border-sky-800/40 dark:bg-sky-950/30">
                        <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        <AlertTitle className="font-semibold text-sky-950 dark:text-sky-100">
                            System Alert: Password Recovery Notice
                        </AlertTitle>
                        <AlertDescription className="mt-2 text-sky-900/90 dark:text-sky-200/90 leading-relaxed text-xs sm:text-sm">
                            {status}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/login">
                                Back to login
                            </Link>
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => router.visit('/forgot-password')}
                                className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                            >
                                Use a different email address
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-6 rounded-lg border bg-muted/40 p-4 text-sm">
                        <div className="flex gap-3">
                            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

                            <div>
                                <p className="font-medium">
                                    Administrator-assisted password recovery
                                </p>

                                <p className="mt-1 text-muted-foreground">
                                    Enter the email you use to sign in. An administrator
                                    will review your request and generate a replacement
                                    temporary password.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                Login email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="email"
                                autoFocus
                                placeholder="Enter your login email"
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

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing
                                ? 'Submitting...'
                                : 'Request Password Reset'}
                        </Button>

                        <div className="text-center text-sm">
                            <TextLink href="/login">
                                Back to login
                            </TextLink>
                        </div>
                    </form>
                </>
            )}
        </AuthLayout>
    );
}