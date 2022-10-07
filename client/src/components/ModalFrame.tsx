import { ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Button, Portal } from 'components';
import styles from './ModalFrame.module.scss';

interface ModalFrameProps {
    children: ReactNode;
    handleCloseModal: () => void;
    header?: ReactNode;
}

const ModalFrame = ({
    children,
    handleCloseModal,
    header,
}: ModalFrameProps) => {
    return (
        <Portal>
            <div className={styles.backdrop} onClick={handleCloseModal}>
                <div
                    className={styles.modal}
                    onClick={(e) => {
                        //prevent closing modal if modal content is clicked
                        e.stopPropagation();
                    }}
                >
                    <Button
                        className={styles.modal_close_button}
                        onClick={handleCloseModal}
                    >
                        <FaTimes />
                    </Button>
                    <div className={styles.header}>
                        <h4>{header}</h4>
                    </div>
                    {children}
                </div>
            </div>
        </Portal>
    );
};

export default ModalFrame;
