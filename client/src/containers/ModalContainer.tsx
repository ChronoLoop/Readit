import CreateSubreaditModal from 'components/CreateSubreaditModal';
import useModalStore from 'store/modal';

const ModalContainer = () => {
    const { showCreateSubreaditModal, toggleShowCreateSubreaditModal } =
        useModalStore();

    return (
        <>
            {showCreateSubreaditModal && (
                <CreateSubreaditModal
                    handleCloseModal={toggleShowCreateSubreaditModal}
                />
            )}
        </>
    );
};

export default ModalContainer;
