import axios from 'axios';
import { PageContentWrapper, PostsList } from 'components';
import { useGetHomePosts } from 'services';

const Home = () => {
    const { data: postsData, isLoading, error } = useGetHomePosts();

    if (isLoading)
        return (
            <PageContentWrapper>
                <PostsList.Loading />
            </PageContentWrapper>
        );
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
