import { Button, Input } from 'components';
import styles from './SignInModalForm.module.scss';
import { getServerErrorResponse, useSignUp } from 'services';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModalModesValues } from './SignInModal';
import ModalFormWrapper from 'components/ModalFormWrapper';

interface SignUpFormProps {
    setCurrentMode: (val: ModalModesValues) => void;
}

const SignUpSchema = z
    .object({
        username: z
            .string()
            .min(4, { message: 'Username must contain at least 4 characters' })
            .max(20, {
                message: 'Username cannot be longer than 20 characters',
            })
            .regex(/^[0-9a-zA-Z]*$/, {
                message: 'Username can only contain alphanumeric characters',
            }),
        password: z
            .string()
            .min(8, { message: 'Password must contain at least 8 characters' })
            .max(20, {
                message: 'Password cannot be longer than 20 characters',
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Confirm password does not match',
        path: ['confirmPassword'],
    });

export type SignUpFormType = z.infer<typeof SignUpSchema>;

const SignUpForm = ({ setCurrentMode }: SignUpFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { isValid, errors },
    } = useForm<SignUpFormType>({
        mode: 'onChange',
        resolver: zodResolver(SignUpSchema),
    });

    const { mutate, isError, error } = useSignUp({
        onSuccess: () => {
            setCurrentMode('LOGIN');
        },
    });

    const onSubmit: SubmitHandler<SignUpFormType> = (data) => {
        return mutate(data);
    };

    return (
        <ModalFormWrapper
            handleSubmit={handleSubmit(onSubmit)}
            error={
                isError &&
                (getServerErrorResponse(error)?.error ||
                    'An error occured when submitting. Please try again.')
            }
        >
            <Input
                id={'username'}
                {...register('username')}
                labelContent="Username"
                error={errors?.username?.message}
            />
            <Input
                id={'password'}
                {...register('password')}
                labelContent="Password"
                isPassword
                error={errors?.password?.message}
            />
            <Input
                id={'confirm-password'}
                {...register('confirmPassword')}
                labelContent="Confirm Password"
                isPassword
                error={errors?.confirmPassword?.message}
            />
            <Button
                variant="primary"
                disabled={!isValid}
                className={styles.button}
                type="submit"
            >
                Sign Up
            </Button>
        </ModalFormWrapper>
    );
};

export default SignUpForm;
