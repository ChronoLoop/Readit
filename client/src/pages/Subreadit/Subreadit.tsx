import { PostsList, PageContentWrapper } from '@/components';
import SubreaditPlaceholderIcon from '@/icons/SubreaditPlaceholderIcon';
import { useGetSubreaditPosts } from '@/services';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styles from './Subreadit.module.scss';
import SubreaditSidebar from './SubreaditSidebar';

const SubreaditTop = () => {
    const { subreaditName } = useParams();
    return (
        <div className={styles.top_container}>
            <div className={styles.background_placeholder}></div>

            <div className={styles.header}>
                <div className={styles.header_main}>
                    <div className={styles.header_main_content}>
                        <SubreaditPlaceholderIcon />
                        <h1>{'r/' + subreaditName}</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Subreadit = () => {
    const { subreaditName = '' } = useParams();

    const {
        data: postsData,
        isFetching,
        error,
        isFetchedAfterMount,
    } = useGetSubreaditPosts(subreaditName);

    if (isFetching || !isFetchedAfterMount)
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

export default Subreadit;
