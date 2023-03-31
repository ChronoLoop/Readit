import cx from 'classnames';
import {
    getServerErrorResponse,
    PostData,
    useCreateSubreaditPostComment,
} from 'services';
import styles from './Post.module.scss';
import { FaRegCommentAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useUserStore from 'store/user';
import { PostVoteControls } from 'components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostCommentSchema, CreatePostCommentData } from 'services';
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

interface PostProps {
    postData: PostData;
    showSubreaditLink?: boolean;
    className?: string;
    showCommentInput?: boolean;
    bodyMuted?: boolean;
}

const Post = ({
    postData,
    showSubreaditLink = true,
    className,
    showCommentInput = false,
    bodyMuted = false,
}: PostProps) => {
    return (
        <div className={cx(styles.container, className)}>
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
                        [styles.content_body_muted]: bodyMuted,
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
        </div>
    );
};

export default Post;
