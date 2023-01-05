import { GetPostsResponse } from 'services';
import { Post } from 'components';
import styles from './PostsList.module.scss';

interface PostsListProps {
    posts?: GetPostsResponse;
    showSubreaditLink?: boolean;
}

const PostsList = ({ posts, showSubreaditLink = true }: PostsListProps) => {
    if (!posts || posts.length === 0) return <div>no posts</div>;
    const postsList = posts.map((postData) => {
        return (
            <Post
                key={postData.id}
                postData={postData}
                showSubreaditLink={showSubreaditLink}
            />
        );
    });
    return <div className={styles.container}>{postsList}</div>;
};

export default PostsList;
