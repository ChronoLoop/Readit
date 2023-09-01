import {
    ReactNode,
    useState,
    forwardRef,
    ForwardedRef,
    ComponentPropsWithoutRef,
} from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import cx from 'classnames';
import styles from './Input.module.scss';
import { Button } from 'components';

const variants = {
    transparent: styles.transparent,
} as const;

interface InputProps extends ComponentPropsWithoutRef<'input'> {
    isPassword?: boolean;
    labelContent?: ReactNode;
    error?: ReactNode;
    variant?: keyof typeof variants;
}

interface InputPasswordEyeProps {
    isPassword?: boolean;
    showPassword: boolean;
    toggleShowPassword: () => void;
}

const InputPasswordEye = ({
    isPassword,
    showPassword,
    toggleShowPassword,
}: InputPasswordEyeProps) => {
    if (!isPassword) return null;

    return (
        <div className={styles.password_icon_container}>
            <Button
                onClick={toggleShowPassword}
                className={styles.password_icon_button}
                type="button"
                tabIndex={-1}
            >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
            </Button>
        </div>
    );
};

const Input = (
    {
        isPassword,
        labelContent,
        className,
        type,
        error,
        variant,
        ...props
    }: InputProps,
    ref: ForwardedRef<HTMLInputElement>
) => {
    const [showPassword, setShowPassword] = useState(isPassword ? false : true);
    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className={styles.container}>
            {labelContent && (
                <div className={styles.label_container}>
                    <label htmlFor={props.id} className={styles.label}>
                        {labelContent}
                    </label>
                </div>
            )}
            <div className={styles.input_container}>
                <input
                    {...props}
                    type={showPassword ? 'text' : 'password'}
                    className={cx(
                        className,
                        styles.input,
                        {
                            [styles.password]: isPassword,
                        },
                        variant && variants[variant]
                    )}
                    ref={ref}
                />
                <InputPasswordEye
                    isPassword={isPassword}
                    showPassword={showPassword}
                    toggleShowPassword={toggleShowPassword}
                />
            </div>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default forwardRef(Input);
