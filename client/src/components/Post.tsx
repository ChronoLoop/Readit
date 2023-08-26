import cx from 'classnames';
import {
    PostData,
    useCreateSubreaditPostComment,
    useDeleteUserPost,
    useGetPostComments,
} from 'services';
import styles from './Post.module.scss';
import { FaRegCommentAlt, FaRegTrashAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from 'store/user';
import {
    Button,
    DeleteModal,
    PostComments,
    PostVoteControls,
} from 'components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostCommentSchema, CreatePostCommentData } from 'services';
import CommentTextArea from './CommentTextArea';
import { useEffect, useState } from 'react';
import { createCommentTagId } from './CommentList';

export const createPostCommentInputTagId = (id: number) => {
    return `post-comment-input-${id}`;
};

interface PostCommentInputProps {
    postId: number;
}

const PostCommentInput = ({ postId }: PostCommentInputProps) => {
    const user = useUserStore((s) => s.user);
    const [newUserCommentId, setNewUserCommentId] = useState<number | null>(
        null
    );
    const { isRefetching, isSuccess } = useGetPostComments(postId);

    useEffect(() => {
        if (newUserCommentId && !isRefetching && isSuccess) {
            const newComment = document.getElementById(
                createCommentTagId(newUserCommentId)
            );
            newComment?.scrollIntoView({ behavior: 'smooth' });
            setNewUserCommentId(null);
        }
    }, [newUserCommentId, isSuccess, isRefetching]);

    const {
        register,
        handleSubmit,
        formState: { isValid },
        resetField,
    } = useForm<CreatePostCommentData>({
        mode: 'onChange',
        resolver: zodResolver(PostCommentSchema),
        defaultValues: {
            postId: postId,
            text: '',
        },
    });

    const { mutate, isLoading } = useCreateSubreaditPostComment({
        onSuccess: (data) => {
            if (data.commentId) setNewUserCommentId(data.commentId);
        },
    });

    const onSubmit: SubmitHandler<CreatePostCommentData> = (data) => {
        mutate(data);
        resetField('text');
    };
    if (!user) return null;

    return (
        <CommentTextArea
            className={styles.comment_input}
            header={`Comment as ${user.username}`}
            showLine
            handleSubmit={handleSubmit(onSubmit)}
            textareaProps={register('text')}
            disableTextArea={isLoading}
            isLoading={isLoading}
            disableSubmitButton={!isValid || isLoading}
        />
    );
};

type PostDeleteButtonProps = {
    postId: number;
    postUserId?: number;
    subreaditName: string;
    closeModal?: () => void;
};

const PostDeleteButton = ({
    postUserId,
    postId,
    subreaditName,
    closeModal,
}: PostDeleteButtonProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = useUserStore((s) => s.user?.id);
    const navigate = useNavigate();
    const { mutate, isLoading } = useDeleteUserPost({
        onSuccess: () => {
            navigate(`/r/${subreaditName}`);
            closeModal?.();
        },
    });

    if (!postUserId || userId !== postUserId) return null;

    return (
        <>
            <Button
                className={styles.delete}
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                <FaRegTrashAlt size={'1rem'} />
                Delete
            </Button>
            {isModalOpen && (
                <DeleteModal
                    closeModal={() => setIsModalOpen(false)}
                    itemToDelete={'post'}
                    onDelete={() => {
                        mutate({ postId, subreaditName });
                    }}
                    showSpinner={isLoading}
                />
            )}
        </>
    );
};

interface PostProps {
    postData: PostData;
    showSubreaditLink?: boolean;
    className?: string;
    showCommentInput?: boolean;
    bodyMuted?: boolean;
    commentedOnUsername?: string;
    closeModal?: () => void;
    openModalToComments?: () => void;
    scrollToComments?: boolean;
}

const Post = ({
    postData,
    showSubreaditLink = true,
    className,
    showCommentInput = false,
    bodyMuted = false,
    commentedOnUsername,
    closeModal,
    openModalToComments,
    scrollToComments,
}: PostProps) => {
    useEffect(() => {
        if (scrollToComments) {
            const commentInput = document.getElementById(
                createPostCommentInputTagId(postData.id)
            );
            commentInput?.scrollIntoView();
        }
    }, [scrollToComments, postData.id]);
    return (
        <>
            <div className={cx(styles.container, className)}>
                {commentedOnUsername ? (
                    <div className={cx(styles.comment, styles.comment_heading)}>
                        <FaRegCommentAlt size={'1rem'} />
                    </div>
                ) : (
                    <PostVoteControls
                        totalVoteValue={postData.totalVoteValue}
                        postId={postData.id}
                        userVote={postData.userVote}
                    />
                )}
                <div className={styles.content}>
                    <div className={styles.general}>
                        {commentedOnUsername && (
                            <>
                                <Link
                                    className={styles.user}
                                    to={`/u/${commentedOnUsername}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {commentedOnUsername}
                                </Link>
                                <span className={styles.muted}>
                                    commented on
                                </span>
                                <span
                                    className={cx(styles.general_title, {
                                        [styles.muted]: bodyMuted,
                                    })}
                                >
                                    {postData.title}
                                </span>
                                <span className={styles.muted}>•</span>
                            </>
                        )}
                        {showSubreaditLink && (
                            <Link
                                className={styles.subreadit}
                                to={`/r/${postData.subreadit.name}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                {'r/' + postData.subreadit.name}
                            </Link>
                        )}
                        {commentedOnUsername && (
                            <span className={styles.muted}>•</span>
                        )}
                        {postData.user && (
                            <span className={styles.muted}>
                                Posted by{' '}
                                <Link
                                    className={styles.user}
                                    to={`/u/${postData.user.username}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    u/{postData.user.username}
                                </Link>
                            </span>
                        )}
                    </div>
                    {!commentedOnUsername && (
                        <>
                            <div
                                className={cx(styles.content_body, {
                                    [styles.content_body_muted]: bodyMuted,
                                })}
                            >
                                <h3 className={styles.title}>
                                    {postData.title}
                                </h3>
                                {postData.text && (
                                    <p className={styles.text}>
                                        {postData.text}
                                    </p>
                                )}
                            </div>
                            <div
                                className={styles.options}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {openModalToComments ? (
                                    <Button
                                        className={styles.comment}
                                        onClick={openModalToComments}
                                    >
                                        <FaRegCommentAlt size={'1rem'} />
                                        {postData.numberOfComments} comments
                                    </Button>
                                ) : (
                                    <div className={styles.comment}>
                                        <FaRegCommentAlt size={'1rem'} />
                                        {postData.numberOfComments} comments
                                    </div>
                                )}
                                <PostDeleteButton
                                    postUserId={postData.user?.id}
                                    postId={postData.id}
                                    subreaditName={postData.subreadit.name}
                                    closeModal={closeModal}
                                />
                            </div>
                        </>
                    )}
                    {showCommentInput && (
                        <div id={createPostCommentInputTagId(postData.id)}>
                            <PostCommentInput postId={postData.id} />
                        </div>
                    )}
                </div>
            </div>
            {showCommentInput && <PostComments postId={postData.id} />}
        </>
    );
};

export default Post;
