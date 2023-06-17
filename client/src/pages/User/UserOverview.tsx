import { PostsList } from 'components';
import PostCard from 'components/PostCard';
import { useParams } from 'react-router-dom';
import { useGetUserProfileOverview } from 'services/profile';
import UserEmptyContent from './UserEmptyContent';

const UserOverview = () => {
    const { username = '' } = useParams();
    const { data, isLoading } = useGetUserProfileOverview(username);
    if (isLoading) return <PostsList.Loading />;
    if (!data || !data.length) return <UserEmptyContent />;

    return (
        <PostsList.Container>
            {data.map((userOverviewPostWithComments) => {
                return (
                    <PostCard
                        key={userOverviewPostWithComments.post.id}
                        postData={userOverviewPostWithComments.post}
                        username={username}
                        userComments={userOverviewPostWithComments.userComments}
                    />
                );
            })}
        </PostsList.Container>
    );
};

export default UserOverview;
