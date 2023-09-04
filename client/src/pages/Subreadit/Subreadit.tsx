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

const SubreaditIndexPage = () => {
    const { subreaditName = '' } = useParams();

    const {
        isLoading: isRecentReadPostsLoading,
        error: recentReadPostsError,
        data: recentReadPostsData,
    } = useGetUserRecentReadSubreaditPosts(subreaditName);
    const {
        data: postsData,
        isLoading: isPostsLoading,
        error: postsError,
    } = useGetSubreaditPosts(subreaditName);

    if (isPostsLoading)
        return (
            <PageContentWrapper
                content={<PostsList.Loading />}
                sidebar={<RecentUserReadPosts isLoading={true} />}
            />
        );
    else if (axios.isAxiosError(postsError)) {
        if (postsError.response?.status === 400)
            return (
                <PageContentWrapper
                    content={
                        <ContentError
                            title="Subreadit does not exist."
                            icon={<FaExclamationTriangle size={'100%'} />}
                        />
                    }
                />
            );
        return (
            <PageContentWrapper
                content={
                    <ContentError
                        icon={<FaExclamationTriangle size={'100%'} />}
                        title="Posts could not be loaded."
                        buttonText="Retry"
                        buttonCallback={() => {
                            window.location.reload();
                        }}
                    />
                }
            />
        );
    }
    return (
        <>
            <SubreaditTop />
            <PageContentWrapper
                content={
                    <PostsList posts={postsData} showSubreaditLink={false} />
                }
                sidebar={
                    <RecentUserReadPosts
                        isLoading={isRecentReadPostsLoading}
                        error={recentReadPostsError}
                        data={recentReadPostsData}
                    />
                }
            />
        </>
    );
};

const SubreaditPage = () => {
    return (
        <Routes>
            <Route path="/" element={<SubreaditIndexPage />} />
            <Route
                path="/comments/:postId"
                element={<SubreaditPostComments />}
            />
        </Routes>
    );
};

export default SubreaditPage;
