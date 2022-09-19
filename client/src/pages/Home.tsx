import { PostsList } from '@/components';
import { getPosts, getUserMe } from '@/services';
import { useQuery } from 'react-query';

const Home = () => {
    const { isFetching } = useQuery('auth-user', getUserMe, {
        retry: false,
    });

    const { data: postsData, isFetching: isFetchingPosts } = useQuery(
        ['posts', 'home-page'],
        getPosts,
        {
            enabled: !isFetching,
        }
    );

    if (isFetching || isFetchingPosts) return <div>Fetching posts...</div>;

    return <PostsList posts={postsData} />;
};

export default Home;
