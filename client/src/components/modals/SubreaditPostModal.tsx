import ModalFrame from 'components/ModalFrame';
import Post from 'components/Post';
import { useGetSubreaditPost } from 'services';
import { usePostModalStore } from 'store/modal';
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
                        closeModal={closeModal}
                    />
                )}
            </div>
        </ModalFrame>
    );
};

const SubreaditPostCommentsModalWrapper = () => {
    const postId = usePostModalStore((s) => s.postModalPostId);
    const closeModal = usePostModalStore((s) => s.closePostModal);
    const prevLocation = usePostModalStore((s) => s.prevLocation);
    const scrollToComments = usePostModalStore((s) => s.scrollToComments);
    if (!postId) return null;
    return (
        <SubreaditPostCommentsModal
            postId={postId}
            closeModal={closeModal}
            prevLocation={prevLocation}
            scrollToComments={scrollToComments}
        />
    );
};

export default SubreaditPostCommentsModalWrapper;
