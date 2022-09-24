import { GetPostsResponse } from '@/services';
import { Post } from '@/components';
import styles from './PostsList.module.scss';

interface PostsListProps {
    posts?: GetPostsResponse;
    showSubredditLink?: boolean;
}
const PostsList = ({ posts, showSubredditLink = true }: PostsListProps) => {
    if (!posts || posts.length === 0) return <div>no posts</div>;
    const postsList = posts.map((postData) => {
        return (
            <Post
                key={postData.id}
                postData={postData}
                showSubredditLink={showSubredditLink}
            />
        );
    });
    return <div className={styles.container}>{postsList}</div>;
};

export default PostsList;
