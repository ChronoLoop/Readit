import axios from 'axios';
import CardWrapper from 'components/CardWrapper';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import {
    PostData,
    useCreateUserReadPost,
    useGetPostById,
    useGetPostVote,
} from 'services';
import { usePostModalStore } from 'store/modal';
import styles from './RecentUserReadPosts.module.scss';

const RecentUserReadPostsLoading = () => {
    return (
        <CardWrapper padding>
            <h2 className={styles.card_heading}>Recent Viewed Posts</h2>
            <RecentUserReadPostsLoadingSection />
            <RecentUserReadPostsLoadingSection />
            <RecentUserReadPostsLoadingSection />
            <RecentUserReadPostsLoadingSection />
        </CardWrapper>
    );
};

const RecentUserReadPostsLoadingSection = () => {
    return (
        <div className={styles.section}>
            <LoadingPlaceholder type="line" className={styles.line} />
            <LoadingPlaceholder type="line5" />
        </div>
    );
};

type RecentUserReadPostsSectionProps = {
    initialPostData: PostData;
};

const RecentUserReadPostsSection = ({
    initialPostData,
}: RecentUserReadPostsSectionProps) => {
    const { mutate } = useCreateUserReadPost(initialPostData.subreadit.name);
    const setPostModal = usePostModalStore((s) => s.setPostModal);

    const { data: postData } = useGetPostById(initialPostData.id, {
        initialData: () => initialPostData,
        staleTime: Infinity,
    });

    const { data: voteData } = useGetPostVote(initialPostData.id, {
        initialData: () => {
            return {
                id: initialPostData.id,
                totalVoteValue: initialPostData.totalVoteValue,
                userVote: initialPostData.userVote,
            };
        },
        staleTime: Infinity,
    });

    if (!postData) return null;

    return (
        <div
            className={styles.section}
            onClick={() => {
                mutate(postData.id);
                setPostModal(postData, false);
            }}
        >
            <h3>{initialPostData.title}</h3>
            <div className={styles.sub_section}>
                <span>{voteData ? voteData.totalVoteValue : 0} points · </span>
                <span>{postData.numberOfComments} comments</span>
            </div>
        </div>
    );
};

type RecentUserReadPostsProps = {
    isLoading: boolean;
    error?: unknown;
    data?: PostData[];
};

const RecentUserReadPosts = ({
    isLoading,
    error,
    data,
}: RecentUserReadPostsProps) => {
    if (isLoading) return <RecentUserReadPostsLoading />;
    else if (axios.isAxiosError(error)) {
        return null;
    } else if (!data || !data.length) return null;
    return (
        <CardWrapper padding>
            <h2 className={styles.card_heading}>Recent Viewed Posts</h2>
            {data.map((postData) => {
                return (
                    <RecentUserReadPostsSection
                        key={postData.id}
                        initialPostData={postData}
                    />
                );
            })}
        </CardWrapper>
    );
};

export default RecentUserReadPosts;
