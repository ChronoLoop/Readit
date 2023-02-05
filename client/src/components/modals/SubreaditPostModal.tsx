import { PostComments, Post } from 'components';
import ModalFrame from 'components/ModalFrame';
import { useGetSubreaditPost } from 'services';
import styles from './SubreaditPostModal.module.scss';

interface SubreaditPostCommentsModalProps {
    postId: number;
    closeModal: () => void;
    prevLocation: string;
}

const SubreaditPostCommentsModal = ({
    postId,
    closeModal,
    prevLocation,
}: SubreaditPostCommentsModalProps) => {
    const { data, isFetching } = useGetSubreaditPost(postId);

    const handleCloseModal = () => {
        window.history.replaceState(null, '', prevLocation);
        closeModal();
    };

    const showData = !(!data || isFetching);

    return (
        <ModalFrame
            className={styles.modal}
            backdropClassName={styles.backdrop}
            handleCloseModal={handleCloseModal}
        >
            <div className={styles.modal_content}>
                {showData && (
                    <>
                        <Post
                            postData={data}
                            clickable={false}
                            showCommentInput
                            closeModal={handleCloseModal}
                        />
                        <PostComments postId={data.id} />
                    </>
                )}
            </div>
        </ModalFrame>
    );
};

export default SubreaditPostCommentsModal;
