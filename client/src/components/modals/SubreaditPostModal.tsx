import ModalFrame from 'components/ModalFrame';
import Post from 'components/Post';
import { useGetSubreaditPost } from 'services';
import styles from './SubreaditPostModal.module.scss';

interface SubreaditPostCommentsModalProps {
    postId: number;
    closeModal: () => void;
    prevLocation: string;
    scrollToComments: boolean;
}

const SubreaditPostCommentsModal = ({
    postId,
    closeModal,
    prevLocation,
    scrollToComments,
}: SubreaditPostCommentsModalProps) => {
    const { data, isLoading } = useGetSubreaditPost(postId);

    const handleCloseModal = () => {
        window.history.replaceState(null, '', prevLocation);
        closeModal();
    };

    const showData = !(!data || isLoading);

    return (
        <ModalFrame
            className={styles.modal}
            backdropClassName={styles.backdrop}
            handleCloseModal={handleCloseModal}
        >
            <div className={styles.modal_content}>
                {showData && (
                    <Post
                        postData={data}
                        showCommentInput
                        scrollToComments={scrollToComments}
                    />
                )}
            </div>
        </ModalFrame>
    );
};

export default SubreaditPostCommentsModal;
