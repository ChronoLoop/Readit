import { getServerErrorResponse, useGetPostComments } from 'services';
import CommentList from './CommentList';
import ErrorText from './ErrorText';

interface PostCommentsProps {
    postId: number;
}
const PostComments = ({ postId }: PostCommentsProps) => {
    const { data, isLoading, isFetching, isError, error } =
        useGetPostComments(postId);

    if (isLoading || isFetching) return null;
    else if (isError)
        return (
            <ErrorText>
                {getServerErrorResponse(error)?.error ??
                    'An error occur, please try refreshing page.'}
            </ErrorText>
        );

    return <CommentList comments={data} />;
};

export default PostComments;
