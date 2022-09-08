import { FaTimes } from 'react-icons/fa';
import cx from 'classnames';

import { Button } from '../Button';
import { Input } from '../Input';
import Portal from '../Portal';
import styles from './SignInModal.module.scss';
import { ObjValues } from '@/types';
import { useMutation, useQueryClient } from 'react-query';
import { getServerErrorResponse, signIn, signUp } from '@/services';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MODAL_MODES = {
    LOGIN: 'LOGIN',
    SIGNUP: 'SIGNUP',
} as const;

type ModalModesValues = ObjValues<typeof MODAL_MODES>;

interface SignInModalProps {
    currentMode: ModalModesValues;
    setCurrentMode: (val: ModalModesValues) => void;
    handleCloseModal: () => void;
}

interface SignInModalTabsProps {
    currentMode: ModalModesValues;
    setCurrentMode: (val: ModalModesValues) => void;
}

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

type SignUpFormType = z.infer<typeof SignUpSchema>;

const SignInSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

type SignInFormType = z.infer<typeof SignInSchema>;

const SignInModalTabs = ({
    currentMode,
    setCurrentMode,
}: SignInModalTabsProps) => {
    return (
        <>
            <div className={styles.header}>
                {currentMode === 'LOGIN' ? (
                    <h4>Log in to Readit</h4>
                ) : (
                    <h4>Join Readit today </h4>
                )}
            </div>

            <ul className={styles.tablist}>
                <li
                    className={cx({
                        [styles.tab_active]: currentMode === 'LOGIN',
                    })}
                >
                    <button
                        className={styles.tab_button}
                        onClick={() => {
                            setCurrentMode('LOGIN');
                        }}
                    >
                        <div className={styles.tab_text_wrapper}>
                            <p>Log In</p>
                        </div>
                    </button>
                </li>
                <li
                    className={cx({
                        [styles.tab_active]: currentMode === 'SIGNUP',
                    })}
                >
                    <button
                        className={styles.tab_button}
                        onClick={() => {
                            setCurrentMode('SIGNUP');
                        }}
                    >
                        <div className={styles.tab_text_wrapper}>
                            <p>Sign Up</p>
                        </div>
                    </button>
                </li>
            </ul>
        </>
    );
};

const SignInForm = () => {
    const {
        register,
        handleSubmit,
        formState: { isValid },
    } = useForm<SignInFormType>({
        mode: 'onChange',
        resolver: zodResolver(SignInSchema),
    });

    const queryClient = useQueryClient();

    const { mutate, isLoading, isError, error } = useMutation(
        (data: SignInFormType) => signIn(data.username, data.password),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('auth-user');
            },
        }
    );

    const onSubmit: SubmitHandler<SignInFormType> = (data) => {
        mutate(data);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
            {isError &&
                (getServerErrorResponse(error)?.error || (
                    <p className={styles.error} role="alert">
                        An error occured when submitting. Please try again.
                    </p>
                ))}
        </form>
    );
};

const SignUpForm = ({ setCurrentMode }: SignUpFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { isValid, errors },
    } = useForm<SignUpFormType>({
        mode: 'onChange',
        resolver: zodResolver(SignUpSchema),
    });

    const { mutate, isError, error } = useMutation(
        (data: SignInFormType) => signUp(data.username, data.password),
        {
            onSuccess: () => {
                setCurrentMode('LOGIN');
            },
        }
    );

    const onSubmit: SubmitHandler<SignUpFormType> = (data) => {
        return mutate(data);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
            {isError &&
                (getServerErrorResponse(error)?.error || (
                    <p className={styles.error} role="alert">
                        An error occured when submitting. Please try again.
                    </p>
                ))}
        </form>
    );
};

const SignInModal = ({
    currentMode,
    setCurrentMode,
    handleCloseModal,
}: SignInModalProps) => {
    return (
        <Portal>
            <div className={styles.backdrop}>
                <div className={styles.modal}>
                    <Button
                        className={styles.modal_close_button}
                        onClick={handleCloseModal}
                    >
                        <FaTimes />
                    </Button>
                    <SignInModalTabs
                        setCurrentMode={setCurrentMode}
                        currentMode={currentMode}
                    />
                    {currentMode === 'LOGIN' ? (
                        <SignInForm />
                    ) : (
                        <SignUpForm setCurrentMode={setCurrentMode} />
                    )}
                </div>
            </div>
        </Portal>
    );
};

export default SignInModal;
