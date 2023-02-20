import { ReactNode, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import cx from 'classnames';
import { Button, Portal } from 'components';
import styles from './ModalFrame.module.scss';

interface ModalFrameProps {
    children: ReactNode;
    handleCloseModal: () => void;
    header?: ReactNode;
    className?: string;
    backdropClassName?: string;
}

const ModalFrame = ({
    children,
    handleCloseModal,
    header,
    className,
    backdropClassName,
}: ModalFrameProps) => {
    const shouldCloseRef = useRef(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.removeAttribute('style');
        };
    }, []);

    return (
        <Portal>
            <div
                className={cx(styles.backdrop, backdropClassName)}
                onClick={() => {
                    if (shouldCloseRef.current === false) return;
                    handleCloseModal();
                }}
                onMouseDown={() => {
                    shouldCloseRef.current = true;
                }}
            >
                <div
                    className={cx(styles.modal, className)}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        shouldCloseRef.current = false;
                    }}
                    onMouseUp={() => {
                        shouldCloseRef.current = false;
                    }}
                >
                    <Button
                        className={styles.modal_close_button}
                        onClick={handleCloseModal}
                    >
                        <FaTimes />
                    </Button>
                    {header && (
                        <div className={styles.header}>
                            <h4>{header}</h4>
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </Portal>
    );
};

export default ModalFrame;
