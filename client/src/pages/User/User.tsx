import { PageContentWrapper } from 'components';
import { Route, Routes } from 'react-router-dom';
import UserComments from './UserComments';
import UserNav from './UserNav';
import UserOverview from './UserOverview';
import UserPosts from './UserPosts';

const UserPage = () => {
    return (
        <>
            <UserNav />
            <PageContentWrapper
                content={
                    <Routes>
                        <Route index element={<UserOverview />} />
                        <Route path="/posts" element={<UserPosts />} />
                        <Route path="/comments" element={<UserComments />} />
                    </Routes>
                }
            />
        </>
    );
};

export default UserPage;
