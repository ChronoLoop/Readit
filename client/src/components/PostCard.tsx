import { useState } from 'react';
import cx from 'classnames';
import {
    PostComments,
    PostData,
    useCheckUserReadPost,
    useCreateUserReadPost,
    useGetPostById,
} from 'services';
import Post from './Post';
import CardWrapper from './CardWrapper';

import styles from './PostCard.module.scss';
import { usePostModalStore } from 'store/modal';

type PostCardProps = {
    className?: string;
    initialPostData: PostData;
    showSubreaditLink?: boolean;
    username?: string;
    initialUserPostComments?: PostComments;
    hidePostContent?: boolean;
};

const PostCard = ({
    className,
    initialPostData,
    showSubreaditLink = true,
    username,
    initialUserPostComments,
    hidePostContent = false,
}: PostCardProps) => {
    const { data: userReadPostData } = useCheckUserReadPost(initialPostData.id);
    const { data: postData } = useGetPostById(initialPostData.id, {
        initialData: initialPostData,
        staleTime: Infinity,
    });
    const { mutate } = useCreateUserReadPost();
    const setPostModal = usePostModalStore((s) => s.setPostModal);
    const [clicked, setClicked] = useState(false);

    const userOwnsPost = username === postData?.user?.username;
    const canHidePostContent = !!(
        initialUserPostComments?.length &&
        (hidePostContent || !userOwnsPost)
    );

    if (!postData || (!postData.user && !initialUserPostComments?.length))
        return null;

    return (
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
                    bodyMuted={!!userReadPostData || clicked}
                    postData={postData}
                    showSubreaditLink={showSubreaditLink}
                    commentedOnUsername={(canHidePostContent && username) || ''}
                    openModalToComments={() => {
                        setPostModal(postData, true);
                    }}
                    isCard
                />
            </div>
            {initialUserPostComments && initialUserPostComments.length && (
                <div className={cx(styles.comments)}>
                    {initialUserPostComments.map((comment) => {
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
    );
};

export default PostCard;
