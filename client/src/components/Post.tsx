import cx from 'classnames';
import {
    getServerErrorResponse,
    PostData,
    useCheckUserReadPost,
    useCreateSubreaditPostComment,
    useCreateUserReadPost,
} from 'services';
import styles from './Post.module.scss';
import { FaRegCommentAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useUserStore from 'store/user';
import { PostVoteControls } from 'components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostCommentSchema, CreatePostCommentData } from 'services';
import SubreaditPostCommentsModal from './modals/SubreaditPostModal';
import { ReactNode, useState } from 'react';
import CommentTextArea from './CommentTextArea';

interface PostCommentInputProps {
    postId: number;
}

const PostCommentInput = ({ postId }: PostCommentInputProps) => {
    const user = useUserStore((s) => s.user);

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
        },
    });

    const { mutate, isLoading, isError, error } =
        useCreateSubreaditPostComment();

    const onSubmit: SubmitHandler<CreatePostCommentData> = (data) => {
        mutate(data);
    };

    if (!user) return null;

    return (
        <CommentTextArea
            header={`Comment as ${user.username}`}
            showLine
            handleSubmit={handleSubmit(onSubmit)}
            textareaProps={register('text')}
            disableTextArea={isLoading}
            isLoading={isLoading}
            disableSubmitButton={!isValid || isLoading}
            error={
                isError &&
                (getServerErrorResponse(error)?.error ||
                    'An error occured when submitting. Please try again.')
            }
        />
    );
};

interface PostWrapperProps {
    children: ReactNode;
    className?: string;
    clickable?: boolean;
    postData: PostData;
    onClick?: () => void;
}

const PostWrapper = ({
    children,
    className,
    clickable,
    postData,
    onClick,
}: PostWrapperProps) => {
    const [showModal, setShowModal] = useState(false);
    const [prevLocation] = useState(window.location.href);

    return (
        <>
            <div
                className={cx(
                    styles.container,
                    {
                        [styles.container_no_hover]: !clickable,
                    },
                    className
                )}
                onClick={() => {
                    if (!clickable) return;
                    onClick?.();

                    window.history.replaceState(
                        null,
                        '',
                        `/r/${postData.subreadit.name}/comments/${postData.id}`
                    );
                    setShowModal(true);
                }}
            >
                {children}
            </div>
            {showModal && (
                <SubreaditPostCommentsModal
                    prevLocation={prevLocation}
                    postId={postData.id}
                    closeModal={() => {
                        setShowModal(false);
                    }}
                />
            )}
        </>
    );
};

interface PostProps {
    postData: PostData;
    showSubreaditLink?: boolean;
    clickable?: boolean;
    className?: string;
    showCommentInput?: boolean;
    closeModal?: () => void;
}

const Post = ({
    postData,
    showSubreaditLink = true,
    clickable = true,
    className,
    showCommentInput = false,
}: PostProps) => {
    const { data } = useCheckUserReadPost(postData.id, { enabled: clickable });
    const { mutate } = useCreateUserReadPost();
    const [clicked, setClicked] = useState(false);

    return (
        <PostWrapper
            postData={postData}
            className={className}
            clickable={clickable}
            onClick={() => {
                mutate(postData.id);
                setClicked(true);
            }}
        >
            <PostVoteControls
                totalVoteValue={postData.totalVoteValue}
                postId={postData.id}
                userVote={postData.userVote}
            />
            <div className={styles.content}>
                <div className={styles.general}>
                    {showSubreaditLink && (
                        <Link
                            className={styles.subreadit}
                            to={`r/${postData.subreadit.name}`}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {'r/' + postData.subreadit.name}
                        </Link>
                    )}
                    <span className={styles.auther}>
                        Posted by{' '}
                        <Link
                            className={styles.user}
                            to={`user/${postData.user.username}`}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            u/{postData.user.username}
                        </Link>
                    </span>
                </div>
                <div
                    className={cx(styles.content_body, {
                        [styles.content_body_muted]:
                            (!!data && clickable) || clicked,
                    })}
                >
                    <h3 className={styles.title}>{postData.title}</h3>
                    {postData.text && (
                        <p className={styles.text}>{postData.text}</p>
                    )}
                </div>
                <div className={styles.comment}>
                    <FaRegCommentAlt size={'1rem'} />
                    {postData.numberOfComments} comments
                </div>
                {showCommentInput && <PostCommentInput postId={postData.id} />}
            </div>
        </PostWrapper>
    );
};

export default Post;
