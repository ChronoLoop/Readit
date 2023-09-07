import {
    PostsList,
    PageContentWrapper,
    ContentError,
    RecentUserReadPosts,
} from 'components';
import {
    useGetSubreaditPosts,
    useGetUserRecentReadSubreaditPosts,
} from 'services';
import axios from 'axios';
import { Route, Routes, useParams } from 'react-router-dom';
import SubreaditPostComments from './SubreaditPostComments';
import SubreaditTop from './SubreaditTop';
import { FaExclamationTriangle } from 'react-icons/fa';
import SubreaditAboutCard from './SubreaditAboutCard';

const SubreaditPageSidebar = () => {
    const { subreaditName = '' } = useParams();
    const {
        isLoading: isRecentReadPostsLoading,
        error: recentReadPostsError,
        data: recentReadPostsData,
    } = useGetUserRecentReadSubreaditPosts(subreaditName);
    return (
        <>
            <SubreaditAboutCard />
            <RecentUserReadPosts
                isLoading={isRecentReadPostsLoading}
                error={recentReadPostsError}
                data={recentReadPostsData}
            />
        </>
    );
};

const SubreaditPageContent = () => {
    const { subreaditName = '' } = useParams();

    const {
        data: postsData,
        isLoading: isPostsLoading,
        error: postsError,
    } = useGetSubreaditPosts(subreaditName);

    if (isPostsLoading) return <PostsList.Loading />;
    else if (axios.isAxiosError(postsError)) {
        if (postsError.response?.status === 400)
            return (
                <ContentError
                    title="Subreadit does not exist."
                    icon={<FaExclamationTriangle size={'100%'} />}
                />
            );
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
    return <PostsList posts={postsData} showSubreaditLink={false} />;
};

const SubreaditIndexPage = () => {
    return (
        <PageContentWrapper
            content={<SubreaditPageContent />}
            sidebar={<SubreaditPageSidebar />}
        />
    );
};

const SubreaditPage = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <>
                        <SubreaditTop />
                        <SubreaditIndexPage />
                    </>
                }
            />
            <Route
                path="/comments/:postId"
                element={<SubreaditPostComments />}
            />
        </Routes>
    );
};

export default SubreaditPage;
