import { useState } from 'react';
import {
    CreatePostCommentData,
    PostComments,
    PostCommentSchema,
    useCreateSubreaditPostComment,
    useDeleteUserComment,
    useGetPostCommentVote,
    useSendPostCommentVote,
    VoteResponse,
} from 'services';
import styles from './CommentList.module.scss';
import { BsArrowsAngleExpand } from 'react-icons/bs';
import Button from './Button';
import VoteControls from './VoteControls';
import { FaCommentAlt, FaRegCommentAlt, FaRegTrashAlt } from 'react-icons/fa';
import CommentTextArea from './CommentTextArea';
import useUserStore from 'store/user';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ContentError from './ContentError';
import { DeleteModal } from './modals';

interface CommentReplyInputProps {
    postId: number;
    commentId: number;
    onClose: () => void;
}

const CommentReplyInput = ({
    postId,
    commentId,
    onClose,
}: CommentReplyInputProps) => {
    const {
        register,
        handleSubmit,
        formState: { isValid },
    } = useForm<CreatePostCommentData>({
        mode: 'onChange',
        resolver: zodResolver(PostCommentSchema),
        defaultValues: {
            postId: postId,
            text: '',
            parentId: commentId,
        },
    });

    const { mutate, isLoading } = useCreateSubreaditPostComment({
        onSuccess: () => {
            onClose();
        },
    });

    const onSubmit: SubmitHandler<CreatePostCommentData> = (data) => {
        mutate(data);
    };

    return (
        <CommentTextArea
            handleSubmit={handleSubmit(onSubmit)}
            textareaProps={register('text')}
            disableTextArea={isLoading}
            isLoading={isLoading}
            disableSubmitButton={!isValid || isLoading}
        />
    );
};

interface CommentVoteControlsProps {
    commentId: number;
    totalVoteValue: number;
    userVote?: VoteResponse['userVote'];
}

const CommentVoteControls = ({
    commentId,
    totalVoteValue,
    userVote,
}: CommentVoteControlsProps) => {
    const { mutate } = useSendPostCommentVote(commentId);

    const { data } = useGetPostCommentVote(commentId, {
        initialData: () => {
            return {
                id: commentId,
                totalVoteValue: totalVoteValue,
                userVote: userVote,
            };
        },
        staleTime: Infinity,
    });

    return (
        <VoteControls
            horizontal
            totalVoteValue={data?.totalVoteValue ?? totalVoteValue}
            userVoteValue={data?.userVote?.value ?? 0}
            onChange={mutate}
        />
    );
};

export const createCommentTagId = (id: number) => {
    return `post-comment-${id}`;
};

type CommentDeleteButtonProps = {
    postId: number;
    commendId: number;
    commentUserId: number;
    username: string;
};

const CommentDeleteButton = ({
    postId,
    commendId,
    commentUserId,
    username,
}: CommentDeleteButtonProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = useUserStore((s) => s.user?.id);
    const { mutate, isLoading } = useDeleteUserComment();

    if (!commentUserId || userId !== commentUserId) return null;

    return (
        <>
            <Button
                className={styles.comment_interactions_button}
                disabled={isLoading}
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                <i className={styles.comment_interactions_button_icon}>
                    <FaRegTrashAlt size={'1rem'} />
                </i>
                delete
            </Button>
            {isModalOpen && (
                <DeleteModal
                    closeModal={() => setIsModalOpen(false)}
                    itemToDelete={'comment'}
                    onDelete={() => {
                        mutate({ postId, commendId, username });
                    }}
                    showSpinner={isLoading}
                />
            )}
        </>
    );
};

interface CommentProps {
    comment: PostComments[number];
    comments: PostComments;
}

const Comment = ({ comment, comments }: CommentProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isReplyInputOpen, setIsReplyInputOpen] = useState(false);
    const isAuth = useUserStore((s) => !!s.user);

    if (!comment) return null;

    const currentCommentReplies = comments.filter(
        (reply) => comment.id === reply.parentId
    );
    const otherReplies = comments.filter(
        (reply) => reply.parentId !== comment.id
    );

    const toggleReplyCommentInput = () => {
        if (!isAuth) return;
        setIsReplyInputOpen((prev) => !prev);
    };

    return (
        <div
            className={styles.comment_container}
            id={createCommentTagId(comment.id)}
        >
            {isOpen ? (
                <>
                    <div
                        className={styles.line}
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-label="Hide replies"
                        role="button"
                    />
                    <div className={styles.comment}>
                        <div className={styles.comment_content}>
                            {comment.user && (
                                <div className={styles.comment_username}>
                                    {comment.user.username}
                                </div>
                            )}
                            <div className={styles.comment_text}>
                                {comment.text}
                            </div>
                        </div>
                        <div className={styles.comment_interactions}>
                            <CommentVoteControls
                                commentId={comment.id}
                                totalVoteValue={comment.totalVoteValue}
                                userVote={comment.userVote}
                            />

                            <Button
                                className={styles.comment_interactions_button}
                                onClick={toggleReplyCommentInput}
                            >
                                <i
                                    className={
                                        styles.comment_interactions_button_icon
                                    }
                                >
                                    <FaRegCommentAlt size={'1rem'} />
                                </i>
                                reply
                            </Button>
                            {comment.user && (
                                <CommentDeleteButton
                                    commentUserId={comment.user.id}
                                    username={comment.user.username}
                                    commendId={comment.id}
                                    postId={comment.postId}
                                />
                            )}
                        </div>
                    </div>
                    {(isReplyInputOpen || !!currentCommentReplies) && (
                        <div className={styles.replies}>
                            {isReplyInputOpen && (
                                <div className={styles.comment_container}>
                                    <div
                                        className={styles.line}
                                        onClick={toggleReplyCommentInput}
                                        aria-label="Hide reply text input"
                                        role="button"
                                    />
                                    <div className={styles.comment}>
                                        <CommentReplyInput
                                            postId={comment.postId}
                                            commentId={comment.id}
                                            onClose={toggleReplyCommentInput}
                                        />
                                    </div>
                                </div>
                            )}
                            {currentCommentReplies.map((reply) => (
                                <Comment
                                    key={reply.id}
                                    comment={reply}
                                    comments={otherReplies}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <Button
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-label="Open replies"
                >
                    <BsArrowsAngleExpand className={styles.open_comment_icon} />
                </Button>
            )}
        </div>
    );
};

interface CommentListProps {
    comments?: PostComments;
}

const CommentList = ({ comments }: CommentListProps) => {
    if (!comments || !comments?.length)
        return (
            <ContentError
                icon={<FaCommentAlt size="100%" />}
                title="No Comments Yet"
                message="Be the first to share what you think"
                iconSize="sm"
                className={styles.no_comment_error}
            />
        );

    const baseComments = comments.filter(
        (comment) => comment.parentId === null
    );
    const replies = comments.filter((comment) => comment.parentId !== null);

    return (
        <div className={styles.comment_list}>
            {baseComments.map((baseComment) => (
                <Comment
                    key={baseComment.id}
                    comment={baseComment}
                    comments={replies}
                />
            ))}
        </div>
    );
};

export default CommentList;
