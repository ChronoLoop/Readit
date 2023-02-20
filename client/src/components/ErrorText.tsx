import { ReactNode } from 'react';
import styles from './ErrorText.module.scss';
import cx from 'classnames';

interface ErrorTextProps {
    children: ReactNode;
    className?: string;
}

const ErrorText = ({ children, className }: ErrorTextProps) => {
    if (!children) return null;

    return (
        <p className={cx(styles.error, className)} role="alert">
            {children}
        </p>
    );
};

export default ErrorText;
