import { PostsList, PageContentWrapper, ContentError } from 'components';
import { useGetSubreaditPosts } from 'services';
import axios from 'axios';
import { Route, Routes, useParams } from 'react-router-dom';
import SubreaditSidebar from './SubreaditSidebar';
import SubreaditPostComments from './SubreaditPostComments';
import SubreaditTop from './SubreaditTop';
import { FaExclamationTriangle } from 'react-icons/fa';

const SubreaditIndex = () => {
    const { subreaditName = '' } = useParams();

    const {
        data: postsData,
        isLoading,
        error,
    } = useGetSubreaditPosts(subreaditName);

    if (isLoading)
        return (
            <>
                <SubreaditTop />
                <PageContentWrapper>
                    <PostsList.Loading />
                    <SubreaditSidebar />
                </PageContentWrapper>
            </>
        );
    else if (axios.isAxiosError(error)) {
        if (error.response?.status === 400)
            return (
                <PageContentWrapper>
                    <ContentError
                        title="Subreadit does not exist."
                        icon={<FaExclamationTriangle size={'100%'} />}
                    />
                </PageContentWrapper>
            );

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
        <>
            <SubreaditTop />
            <PageContentWrapper>
                <PostsList posts={postsData} showSubreaditLink={false} />
                <SubreaditSidebar />
            </PageContentWrapper>
        </>
    );
};

const SubreaditPage = () => {
    return (
        <Routes>
            <Route path="/" element={<SubreaditIndex />} />
            <Route
                path="/comments/:postId"
                element={<SubreaditPostComments />}
            />
        </Routes>
    );
};

export default SubreaditPage;
