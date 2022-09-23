import { PageContentWrapper, PostsList } from '@/components';
import { getPosts, useUserQuery } from '@/services';
import { useQuery } from 'react-query';

const Home = () => {
    const { isFetching } = useUserQuery();

    const { data: postsData, isFetching: isFetchingPosts } = useQuery(
        ['posts', 'home'],
        getPosts,
        {
            enabled: !isFetching,
        }
    );

    if (isFetching || isFetchingPosts)
        return <PageContentWrapper>Fetching posts...</PageContentWrapper>;

    return (
        <PageContentWrapper>
            <PostsList posts={postsData} />
        </PageContentWrapper>
    );
};

export default Home;
