import axios from 'axios';
import {
    PageContentWrapper,
    PostsList,
    ContentError,
    RecentUserReadPosts,
} from 'components';
import HomeAboutCard from './HomeAboutCard';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useGetHomePosts, useGetUserRecentReadPosts } from 'services';

const HomePageSidebar = () => {
    const { isLoading, error, data } = useGetUserRecentReadPosts();
    return (
        <>
            <HomeAboutCard />
            <RecentUserReadPosts
                isLoading={isLoading}
                error={error}
                data={data}
            />
        </>
    );
};

const HomePageContent = () => {
    const { data: postsData, isLoading, error } = useGetHomePosts();

    if (isLoading) return <PostsList.Loading />;
    else if (axios.isAxiosError(error)) {
        return (
            <ContentError
                icon={<FaExclamationTriangle size={'100%'} />}
                title="Posts could not be loaded."
                buttonText="Retry"
                buttonCallback={() => {
                    window.location.reload();
                }}
            />
        );
    }

    return <PostsList posts={postsData} />;
};

const HomePage = () => {
    return (
        <PageContentWrapper
            content={<HomePageContent />}
            sidebar={<HomePageSidebar />}
        />
    );
};

export default HomePage;
