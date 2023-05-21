import { PostsList } from 'components';
import PostCard from 'components/PostCard';
import { useParams } from 'react-router-dom';
import { useGetUserProfileOverview } from 'services/profile';

const UserComments = () => {
    const { username = '' } = useParams();
    const { data, isLoading } = useGetUserProfileOverview(username);
    if (isLoading) return <PostsList.Loading />;
    if (!data) return <>no posts or comments</>;

    return (
        <PostsList.Container>
            {data.map((userOverviewPostWithComments) => {
                if (!userOverviewPostWithComments.userComments?.length)
                    return null;
                return (
                    <PostCard
                        key={userOverviewPostWithComments.post.id}
                        postData={userOverviewPostWithComments.post}
                        username={username}
                        userComments={userOverviewPostWithComments.userComments}
                        hidePostContent={true}
                    />
                );
            })}
        </PostsList.Container>
    );
};

export default UserComments;
