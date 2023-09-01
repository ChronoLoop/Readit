import { CreateSubreaditModal } from 'components';
import SubreaditPostCommentsModal from 'components/modals/SubreaditPostModal';

const GlobalModalsContainer = () => {
    return (
        <>
            <CreateSubreaditModal />
            <SubreaditPostCommentsModal />
        </>
    );
};

export default GlobalModalsContainer;
