import axios from 'axios';
import { PageContentWrapper, PostsList } from 'components';
import { useGetHomePosts } from 'services';

const Home = () => {
    const {
        data: postsData,
        isFetching,
        isFetchedAfterMount,
        error,
    } = useGetHomePosts();

    if (isFetching || !isFetchedAfterMount)
        return <PageContentWrapper>Fetching posts...</PageContentWrapper>;
    else if (axios.isAxiosError(error)) {
        return <PageContentWrapper>Could not fetch posts</PageContentWrapper>;
    }

    return (
        <PageContentWrapper>
            <PostsList posts={postsData} />
        </PageContentWrapper>
    );
};

export default Home;
