import cx from 'classnames';
import { GetPostsResponse } from 'services';
import styles from './PostsList.module.scss';
import PostCard from './PostCard';
import CardWrapper from './CardWrapper';
import { ContentError } from 'components';
import { useNavigate } from 'react-router-dom';
import useCreateSubreaditPostRoute from 'hooks/useCreateSubreaditPostRoute';
import LoadingPlaceholder from './LoadingPlaceholder';

const PostCardLoading = () => {
    return (
        <CardWrapper
            className={cx(styles.card, styles.card_loading)}
            paddingTopRightBottom
        >
            <LoadingPlaceholder type="line2" />
            <LoadingPlaceholder type="line5" />
            <LoadingPlaceholder type="textblock" />
            <LoadingPlaceholder type="line2" />
        </CardWrapper>
    );
};

const PostListLoading = () => {
    return (
        <>
            <PostCardLoading />
            <PostCardLoading />
            <PostCardLoading />
            <PostCardLoading />
            <PostCardLoading />
        </>
    );
};

interface PostsListProps {
    posts?: GetPostsResponse;
    showSubreaditLink?: boolean;
}

const PostsList = ({ posts, showSubreaditLink = true }: PostsListProps) => {
    const navigate = useNavigate();
    const route = useCreateSubreaditPostRoute();

    if (!posts || posts.length === 0)
        return (
            <ContentError
                title="There are no posts in this subreadit"
                message="Be the first to make a post"
                buttonText="Add a post"
                buttonCallback={() => {
                    navigate(route);
                }}
            />
        );

    const postsList = posts.map((postData) => {
        return (
            <PostCard
                key={postData.id}
                initialPostData={postData}
                showSubreaditLink={showSubreaditLink}
            />
        );
    });

    return <>{postsList}</>;
};

PostsList.Loading = PostListLoading;

export default PostsList;
