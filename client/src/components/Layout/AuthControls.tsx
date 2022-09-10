import { Button } from '@/components';
import { useState } from 'react';
import styles from './AuthControls.module.scss';
import { SignInModal } from '@/components';
import { ModalModesValues } from '../SignInModal/SignInModal';

const AuthControls = () => {
    const [currentModalMode, setCurrentModalMode] =
        useState<ModalModesValues | null>(null);

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
