import { GetPostsResponse } from '@/services';
import { Post } from '@/components';
import styles from './PostsList.module.scss';

interface PostsListProps {
    posts?: GetPostsResponse;
}
const PostsList = ({ posts }: PostsListProps) => {
    if (!posts) return <div>no posts</div>;
    const postsList = posts.map((postData) => {
        return <Post key={postData.id} postData={postData} />;
    });
    return <div className={styles.container}>{postsList}</div>;
};

export default PostsList;
