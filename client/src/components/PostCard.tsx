import { useState } from 'react';
import SubreaditPostCommentsModal from './modals/SubreaditPostModal';
import {
    PostData,
    useCheckUserReadPost,
    useCreateUserReadPost,
} from 'services';
import Post from './Post';
import CardWrapper from './CardWrapper';

interface PostCardProps {
    className?: string;
    postData: PostData;
    showSubreaditLink?: boolean;
}

const PostCard = ({
    className,
    postData,
    showSubreaditLink = true,
}: PostCardProps) => {
    const { data } = useCheckUserReadPost(postData.id);
    const [prevLocation] = useState(window.location.href);
    const { mutate } = useCreateUserReadPost();
    const [clicked, setClicked] = useState(false);
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <CardWrapper
                className={className}
                onClick={() => {
                    mutate(postData.id);
                    setClicked(true);

                    window.history.replaceState(
                        null,
                        '',
                        `/r/${postData.subreadit.name}/comments/${postData.id}`
                    );
                    setShowModal(true);
                }}
            >
                <Post
                    bodyMuted={!!data || clicked}
                    postData={postData}
                    showSubreaditLink={showSubreaditLink}
                />
            </CardWrapper>
            {showModal && (
                <SubreaditPostCommentsModal
                    prevLocation={prevLocation}
                    postId={postData.id}
                    closeModal={() => {
                        setShowModal((prev) => !prev);
                    }}
                />
            )}
        </>
    );
};

export default PostCard;
