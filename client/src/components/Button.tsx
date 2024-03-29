import { ComponentPropsWithoutRef, ReactNode } from 'react';
import cx from 'classnames';
import styles from './Button.module.scss';
import { ImSpinner2 } from 'react-icons/im';

const VARIANTS = {
    primary: styles.primary,
    secondary: styles.secondary,
    borderHover: styles.border_hover,
    border: styles.border,
    none: styles.none,
} as const;

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
    children: ReactNode;
    variant?: keyof typeof VARIANTS;
    disablePadding?: boolean;
    disableBackground?: boolean;
    showSpinner?: boolean;
    center?: boolean;
}

const Button = ({
    children,
    type = 'button',
    className,
    variant,
    disabled,
    disablePadding,
    disableBackground,
    showSpinner,
    center = true,
    ...props
}: ButtonProps) => {
    return (
        <button
            {...props}
            disabled={disabled}
            type={type}
            className={cx(
                className,
                styles.button,
                { [styles.button_no_padding]: disablePadding },
                { [styles.button_no_background]: disableBackground },
                { [styles.button_center]: center },
                !disabled && variant && VARIANTS[variant]
            )}
        >
            {showSpinner ? <ImSpinner2 className={styles.spinner} /> : children}
        </button>
    );
};

export default Button;
