import { useState } from 'react';
import cx from 'classnames';
import {
    PostComments,
    PostData,
    useCheckUserReadPost,
    useCreateUserReadPost,
} from 'services';
import Post from './Post';
import CardWrapper from './CardWrapper';

import styles from './PostCard.module.scss';
import { usePostModalStore } from 'store/modal';

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
    const { mutate } = useCreateUserReadPost();
    const setPostModal = usePostModalStore((s) => s.setPostModal);
    const [clicked, setClicked] = useState(false);

    const userOwnsPost = username === postData.user?.username;
    const canHidePostContent = !!(
        userComments?.length &&
        (hidePostContent || !userOwnsPost)
    );

    return (
        <>
            <CardWrapper
                className={className}
                onClick={() => {
                    mutate(postData.id);
                    setClicked(true);
                    setPostModal(postData, false);
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
                            setPostModal(postData, true);
                        }}
                        isCard
                    />
                </div>
                {userComments && userComments.length && (
                    <div className={cx(styles.comments)}>
                        {userComments.map((comment) => {
                            return (
                                <div
                                    className={cx(styles.comments_item)}
                                    key={comment.id}
                                >
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
                                            {comment.user && (
                                                <div
                                                    className={
                                                        styles.comments_item_user
                                                    }
                                                >
                                                    {comment.user.username}
                                                </div>
                                            )}
                                            <div>{comment.text}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardWrapper>
        </>
    );
};

export default PostCard;
