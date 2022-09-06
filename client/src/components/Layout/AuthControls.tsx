import { Button } from '@/components';
import { ComponentProps, useState } from 'react';
import styles from './AuthControls.module.scss';
import { SignInModal } from '@/components';

type ModalModes = ComponentProps<typeof SignInModal>['currentMode'];

const AuthControls = () => {
    const [currentModalMode, setCurrentModalMode] = useState<ModalModes | null>(
        null
    );

    const handleLogInClick = () => {
        setCurrentModalMode('LOGIN');
    };

    const handleSignUpClick = () => {
        setCurrentModalMode('SIGNUP');
    };

    const handleCloseModal = () => {
        setCurrentModalMode(null);
    };

    return (
        <div className={styles.container}>
            <Button variant="secondary" onClick={handleLogInClick}>
                Log In
            </Button>
            <Button variant="primary" onClick={handleSignUpClick}>
                Sign Up
            </Button>
            {currentModalMode && (
                <SignInModal
                    currentMode={currentModalMode}
                    setCurrentMode={setCurrentModalMode}
                    handleCloseModal={handleCloseModal}
                />
            )}
        </div>
    );
};

export default AuthControls;
