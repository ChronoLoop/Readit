import axios from 'axios';
import { PageContentWrapper, PostsList, ContentError } from 'components';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useGetHomePosts } from 'services';

const HomePage = () => {
    const { data: postsData, isLoading, error } = useGetHomePosts();

    if (isLoading)
        return (
            <PageContentWrapper>
                <PostsList.Loading />
            </PageContentWrapper>
        );
    else if (axios.isAxiosError(error)) {
        return (
            <PageContentWrapper>
                <ContentError
                    icon={<FaExclamationTriangle size={'100%'} />}
                    title="Posts could not be loaded."
                    buttonText="Retry"
                    buttonCallback={() => {
                        window.location.reload();
                    }}
                />
            </PageContentWrapper>
        );
    }

    return (
        <PageContentWrapper>
            <PostsList posts={postsData} />
        </PageContentWrapper>
    );
};

export default HomePage;
