import { PostData } from '@/services';
import styles from './Post.module.scss';
import { FaRegCommentAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import PostVoteControls from '../PostVoteControls/PostVoteControls';

interface PostProps {
    postData: PostData;
}

const Post = ({ postData }: PostProps) => {
    const navigate = useNavigate();
    return (
        <div
            className={styles.container}
            onClick={() => {
                navigate(`r/${postData.subreddit.name}/${postData.id}`);
            }}
        >
            <PostVoteControls
                postId={postData.id}
                totalVoteValue={postData.totalVoteValue}
                userVoteValue={postData.userVote?.value}
            />
            <div className={styles.content}>
                <div className={styles.general}>
                    <Link
                        className={styles.subreddit}
                        to={`r/${postData.subreddit.name}`}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {'r/' + postData.subreddit.name}
                    </Link>
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
                <div className={styles.title}>{postData.title}</div>
                <p>{postData.text}</p>
                <div className={styles.comment}>
                    <FaRegCommentAlt size={'1rem'} />
                    {postData.numberOfComments} comments
                </div>
            </div>
        </div>
    );
};

export default Post;
