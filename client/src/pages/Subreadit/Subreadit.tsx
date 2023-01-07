import { PostsList, PageContentWrapper, Button } from 'components';
import SubreaditPlaceholderIcon from 'icons/SubreaditPlaceholderIcon';
import {
    getServerErrorResponseStatus,
    useGetSubreaditMe,
    useGetSubreaditPosts,
    useJoinSubreadit,
    useLeaveSubreadit,
} from 'services';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styles from './Subreadit.module.scss';
import SubreaditSidebar from './SubreaditSidebar';

const SubreaditJoinButton = () => {
    const { subreaditName = '' } = useParams();
    const { mutate } = useJoinSubreadit();

    return (
        <Button
            variant="primary"
            className={styles.join_btn}
            onClick={() => {
                mutate(subreaditName);
            }}
        >
            Join
        </Button>
    );
};

const SubreaditLeaveButton = () => {
    const { subreaditName = '' } = useParams();
    const { mutate } = useLeaveSubreadit();

    return (
        <Button
            variant="border"
            className={styles.join_btn}
            onClick={() => {
                mutate(subreaditName);
            }}
        >
            <span className={styles.joined_txt}>Joined</span>
            <span className={styles.leave_txt}>Leave</span>
        </Button>
    );
};

const SubreaditJoinLeaveButton = () => {
    const { subreaditName = '' } = useParams();
    const { data, isFetching, isFetched, error, isError } =
        useGetSubreaditMe(subreaditName);
    const hasJoined = !!data?.username;

    if (
        isFetching ||
        !isFetched ||
        (isError && getServerErrorResponseStatus(error) !== 404)
    )
        return null;
    else if (hasJoined) return <SubreaditLeaveButton />;
    return <SubreaditJoinButton />;
};

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
                        <SubreaditJoinLeaveButton />
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
