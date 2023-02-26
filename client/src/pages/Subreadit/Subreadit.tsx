import { PostsList, PageContentWrapper } from 'components';
import { useGetSubreaditPosts } from 'services';
import axios from 'axios';
import { Route, Routes, useParams } from 'react-router-dom';
import SubreaditSidebar from './SubreaditSidebar';
import SubreaditPostComments from './SubreaditPostComments';
import SubreaditTop from './SubreaditTop';

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
                <PageContentWrapper>Fetching posts...</PageContentWrapper>
            </>
        );
    else if (axios.isAxiosError(error) && error.response?.status === 400) {
        return (
            <PageContentWrapper>subreaddit does not exist</PageContentWrapper>
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

const Subreadit = () => {
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

export default Subreadit;
