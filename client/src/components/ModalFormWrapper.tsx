import { FormEventHandler, ReactNode } from 'react';
import styles from './ModalFormWrapper.module.scss';

interface ModalFormWrapperProps {
    children: ReactNode;
    error?: ReactNode;
    handleSubmit: FormEventHandler;
}
const ModalFormWrapper = ({
    children,
    error,
    handleSubmit,
}: ModalFormWrapperProps) => {
    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {children}
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </form>
    );
};

export default ModalFormWrapper;
