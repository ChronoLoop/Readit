import { PageContentWrapper, PostsList } from '@/components';
import { useGetHomePosts } from '@/services';

const Home = () => {
    const { data: postsData, isFetching, isFetched } = useGetHomePosts();

    if (isFetching || !isFetched)
        return <PageContentWrapper>Fetching posts...</PageContentWrapper>;

    return (
        <PageContentWrapper>
            <PostsList posts={postsData} />
        </PageContentWrapper>
    );
};

export default Home;
