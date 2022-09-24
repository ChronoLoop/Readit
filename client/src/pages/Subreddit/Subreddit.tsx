import { PostsList, PageContentWrapper } from '@/components';
import SubredditPlaceholderIcon from '@/icons/SubredditPlaceholderIcon';
import { getSubredditPosts, useUserQuery } from '@/services';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import styles from './Subreddit.module.scss';
import SubredditSidebar from './SubredditSidebar';

const SubredditTop = () => {
    const { subredditName } = useParams();
    return (
        <div className={styles.top_container}>
            <div className={styles.background_placeholder}></div>

            <div className={styles.header}>
                <div className={styles.header_main}>
                    <div className={styles.header_main_content}>
                        <SubredditPlaceholderIcon />
                        <h1>{'r/' + subredditName}</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Subreddit = () => {
    const { subredditName = '' } = useParams();
    const { isFetching } = useUserQuery();

    const {
        data: postsData,
        isFetching: isFetchingPosts,
        error,
    } = useQuery(
        ['posts', 'subreddit', subredditName],
        () => getSubredditPosts(subredditName),
        { enabled: !!subredditName && !isFetching }
    );

    if (isFetching || isFetchingPosts)
        return (
            <>
                <SubredditTop />
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
            <SubredditTop />
            <PageContentWrapper>
                <PostsList posts={postsData} showSubredditLink={false} />
                <SubredditSidebar />
            </PageContentWrapper>
        </>
    );
};

export default Subreddit;
