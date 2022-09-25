import { FaTimes } from 'react-icons/fa';
import cx from 'classnames';

import { Button } from 'components';
import Portal from '../Portal';
import styles from './SignInModal.module.scss';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export type ModalModesValues = 'LOGIN' | 'SIGNUP';

interface SignInModalProps {
    currentMode: ModalModesValues;
    setCurrentMode: (val: ModalModesValues) => void;
    handleCloseModal: () => void;
}

interface SignInModalTabsProps {
    currentMode: ModalModesValues;
    setCurrentMode: (val: ModalModesValues) => void;
}

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
