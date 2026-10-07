import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register — UniReserve" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name" className="text-gray-700 font-medium text-sm">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="e.g. Juan Dela Cruz"
                                    className="border-gray-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-400 bg-gray-50 h-11"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="your.email@school.edu"
                                    className="border-gray-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-400 bg-gray-50 h-11"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    passwordrules={passwordRules}
                                    className="border-gray-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-400 bg-gray-50 h-11"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation" className="text-gray-700 font-medium text-sm">
                                    Confirm Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repeat your password"
                                    passwordrules={passwordRules}
                                    className="border-gray-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-400 bg-gray-50 h-11"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-[#0B2568] hover:bg-[#071a4d] text-white font-bold rounded-xl transition-all shadow-md mt-1 cursor-pointer"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {processing ? 'Creating Account...' : 'Create Student Account'}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6} className="text-blue-600 hover:text-blue-700 font-medium">
                                Sign in here
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create a Student Account',
    description: 'Register to start reserving school uniforms and supplies',
};
