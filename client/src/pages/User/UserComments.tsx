import axios from 'axios';
import { PostsList } from 'components';
import PostCard from 'components/PostCard';
import { useParams } from 'react-router-dom';
import { useGetUserProfileOverview } from 'services/profile';
import UserEmptyContent from './UserEmptyContent';
import UserErrorContent from './UserErrorContent';

const UserComments = () => {
    const { username = '' } = useParams();
    const { data, isLoading, error } = useGetUserProfileOverview(username);
    if (isLoading) return <PostsList.Loading />;
    else if (axios.isAxiosError(error)) {
        return <UserErrorContent error={error} />;
    } else if (!data || !data.length) return <UserEmptyContent />;

    return (
        <>
            {data.map((userOverviewPostWithComments) => {
                if (!userOverviewPostWithComments.userComments?.length)
                    return null;
                return (
                    <PostCard
                        key={userOverviewPostWithComments.post.id}
                        initialPostData={userOverviewPostWithComments.post}
                        username={username}
                        initialUserPostComments={
                            userOverviewPostWithComments.userComments
                        }
                        hidePostContent={true}
                    />
                );
            })}
        </>
    );
};

export default UserComments;
