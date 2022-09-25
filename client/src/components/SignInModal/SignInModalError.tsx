import { getServerErrorResponse } from 'services';
import styles from './SignInModalForm.module.scss';

interface SignInModalFormErrorProps {
    error: unknown;
}

const SignInModalFormError = ({ error }: SignInModalFormErrorProps) => {
    return (
        <p className={styles.error} role="alert">
            {getServerErrorResponse(error)?.error ||
                'An error occured when submitting. Please try again.'}
        </p>
    );
};

export default SignInModalFormError;
