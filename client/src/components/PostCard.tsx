import { useState } from 'react';
import cx from 'classnames';
import SubreaditPostCommentsModal from './modals/SubreaditPostModal';
import {
    PostComments,
    PostData,
    useCheckUserReadPost,
    useCreateUserReadPost,
} from 'services';
import Post from './Post';
import CardWrapper from './CardWrapper';

import styles from './PostCard.module.scss';

interface PostCardProps {
    className?: string;
    postData: PostData;
    showSubreaditLink?: boolean;
    username?: string;
    userComments?: PostComments;
    hidePostContent?: boolean;
}

const PostCard = ({
    className,
    postData,
    showSubreaditLink = true,
    username,
    userComments,
    hidePostContent = false,
}: PostCardProps) => {
    const { data } = useCheckUserReadPost(postData.id);
    const [prevLocation] = useState(window.location.href);
    const { mutate } = useCreateUserReadPost();
    const [clicked, setClicked] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [scrollToComments, setScrollToComments] = useState(false);

    const userOwnsPost = username === postData.user?.username;
    const canHidePostContent = !!(
        userComments?.length &&
        (hidePostContent || !userOwnsPost)
    );

    const handleCloseModal = () => {
        setShowModal((prev) => !prev);
        setScrollToComments(false);
    };

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
                <div
                    className={cx(styles.post_card, {
                        [styles.post_comment_card]: canHidePostContent,
                    })}
                >
                    <Post
                        bodyMuted={!!data || clicked}
                        postData={postData}
                        showSubreaditLink={showSubreaditLink}
                        commentedOnUsername={
                            (canHidePostContent && username) || ''
                        }
                        openModalToComments={() => {
                            setShowModal(true);
                            setScrollToComments(true);
                        }}
                    />
                </div>
                {userComments && userComments.length && (
                    <div className={cx(styles.comments)}>
                        {userComments.map((comment) => {
                            return (
                                <div className={cx(styles.comments_item)}>
                                    <div
                                        className={cx(
                                            styles.comments_item_container
                                        )}
                                    >
                                        <div
                                            className={cx(
                                                styles.comments_item_content
                                            )}
                                        >
                                            <div
                                                className={
                                                    styles.comments_item_user
                                                }
                                            >
                                                {comment.user.username}
                                            </div>
                                            <div>{comment.text}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardWrapper>
            {showModal && (
                <SubreaditPostCommentsModal
                    prevLocation={prevLocation}
                    postId={postData.id}
                    scrollToComments={scrollToComments}
                    closeModal={() => {
                        handleCloseModal();
                    }}
                />
            )}
        </>
    );
};

export default PostCard;
