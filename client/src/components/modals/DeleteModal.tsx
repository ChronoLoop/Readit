import Button from 'components/Button';
import ModalFrame from 'components/ModalFrame';
import styles from './DeleteModal.module.scss';

type DeleteModalProps = {
    closeModal: () => void;
    itemToDelete: string;
    onDelete: () => void;
    showSpinner: boolean;
};

const DeleteModal = ({
    closeModal,
    itemToDelete,
    onDelete,
    showSpinner,
}: DeleteModalProps) => {
    return (
        <ModalFrame
            className={styles.modal}
            backdropClassName={styles.backdrop}
            handleCloseModal={closeModal}
            header={`Delete ${itemToDelete}`}
        >
            <div className={styles.modal_content}>
                Are you sure you want to delete {itemToDelete}?
            </div>
            <Button
                variant="primary"
                type="submit"
                className={styles.button}
                onClick={onDelete}
                showSpinner={showSpinner}
            >
                Delete
            </Button>
        </ModalFrame>
    );
};

export default DeleteModal;
