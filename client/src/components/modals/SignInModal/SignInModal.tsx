import cx from 'classnames';

import { ModalFrame } from 'components';
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
    );
};

const SignInModal = ({
    currentMode,
    setCurrentMode,
    handleCloseModal,
}: SignInModalProps) => {
    return (
        <ModalFrame
            handleCloseModal={handleCloseModal}
            header={
                currentMode === 'LOGIN'
                    ? 'Log in to Readit'
                    : 'Join Readit today'
            }
        >
            <SignInModalTabs
                setCurrentMode={setCurrentMode}
                currentMode={currentMode}
            />
            {currentMode === 'LOGIN' ? (
                <SignInForm />
            ) : (
                <SignUpForm setCurrentMode={setCurrentMode} />
            )}
        </ModalFrame>
    );
};

export default SignInModal;
