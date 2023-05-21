import { GetPostsResponse } from 'services';
import cx from 'classnames';
import styles from './PostsList.module.scss';
import PostCard from './PostCard';
import CardWrapper from './CardWrapper';
import { ReactNode } from 'react';

const PostCardLoading = () => {
    return (
        <CardWrapper className={styles.card} disableHover paddingAround>
            <div className={cx(styles.loading_line, styles.loading_line_2)} />
            <div className={cx(styles.loading_line, styles.loading_line_5)} />
            <div className={cx(styles.loading_text_block)} />
            <div className={cx(styles.loading_line, styles.loading_line_2)} />
        </CardWrapper>
    );
};

const PostListLoading = () => {
    return (
        <div className={styles.container}>
            <PostCardLoading />
            <PostCardLoading />
            <PostCardLoading />
            <PostCardLoading />
            <PostCardLoading />
        </div>
    );
};

interface PostsListContainerProps {
    children: ReactNode;
}

const PostsListContainer = ({ children }: PostsListContainerProps) => {
    return <div className={styles.container}>{children}</div>;
};

interface PostsListProps {
    posts?: GetPostsResponse;
    showSubreaditLink?: boolean;
}

const PostsList = ({ posts, showSubreaditLink = true }: PostsListProps) => {
    if (!posts || posts.length === 0) return <div>no posts</div>;

    const postsList = posts.map((postData) => {
        return (
            <PostCard
                key={postData.id}
                postData={postData}
                showSubreaditLink={showSubreaditLink}
            />
        );
    });

    return <PostsListContainer>{postsList}</PostsListContainer>;
};

PostsList.Loading = PostListLoading;
PostsList.Container = PostsListContainer;

export default PostsList;
