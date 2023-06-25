import { Button, Input, ModalFormWrapper } from 'components';
import { useSignIn } from 'services';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './SignInModalForm.module.scss';

const SignInSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

export type SignInFormType = z.infer<typeof SignInSchema>;

const SignInForm = () => {
    const {
        register,
        handleSubmit,
        formState: { isValid },
    } = useForm<SignInFormType>({
        mode: 'onChange',
        resolver: zodResolver(SignInSchema),
    });

    const { mutate, isLoading } = useSignIn();

    const onSubmit: SubmitHandler<SignInFormType> = (data) => {
        mutate(data);
    };

    return (
        <ModalFormWrapper handleSubmit={handleSubmit(onSubmit)}>
            <Input
                id={'username'}
                {...register('username')}
                labelContent="Username"
                disabled={isLoading}
            />
            <Input
                id={'password'}
                {...register('password')}
                labelContent="Password"
                isPassword
                disabled={isLoading}
            />
            <Button
                variant="primary"
                type="submit"
                disabled={!isValid || isLoading}
                showSpinner={isLoading}
                className={styles.button}
            >
                Log In
            </Button>
        </ModalFormWrapper>
    );
};

export default SignInForm;
