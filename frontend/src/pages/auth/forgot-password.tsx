import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
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
            title="Forgot password?"
            description="Submit a password reset request for your guardian portal account."
        >
            <Head title="Forgot Password" />

            <div className="mb-6 rounded-lg border bg-muted/40 p-4 text-sm">
                <div className="flex gap-3">
                    <KeyRound className="mt-0.5 h-5 w-5 shrink-0" />

                    <div>
                        <p className="font-medium">
                            Administrator-assisted password recovery
                        </p>

                        <p className="mt-1 text-muted-foreground">
                            Enter the email you use to sign in. An administrator
                            will review your request and generate a new
                            temporary password.
                        </p>
                    </div>
                </div>
            </div>

            {status && (
                <div className="mb-6 rounded-lg border p-4 text-sm">
                    {status}
                </div>
            )}

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
        </AuthLayout>
    );
}