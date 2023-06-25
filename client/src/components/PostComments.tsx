import { getServerErrorResponse, useGetPostComments } from 'services';
import CommentList from './CommentList';
import ContentError from './ContentError';

interface PostCommentsProps {
    postId: number;
}
const PostComments = ({ postId }: PostCommentsProps) => {
    const { data, isLoading, isError, error } = useGetPostComments(postId);

    if (isLoading) return null;
    else if (isError)
        return (
            <ContentError
                title={
                    getServerErrorResponse(error)?.error ??
                    'An error occur, please try refreshing page.'
                }
            />
        );

    return <CommentList comments={data} />;
};

export default PostComments;
