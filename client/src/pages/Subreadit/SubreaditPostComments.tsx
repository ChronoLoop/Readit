import axios from 'axios';
import { PostComments, Post, PageContentWrapper } from 'components';
import { useParams } from 'react-router-dom';
import { useGetSubreaditPost } from 'services';
import styles from './SubreaditPostComments.module.scss';
import SubreaditTop from './SubreaditTop';

const SubreaditPostCommentsContent = () => {
    const { postId = '' } = useParams();
    const { data, isFetching, isFetchedAfterMount, error } =
        useGetSubreaditPost(parseInt(postId));

    if (isFetching || !isFetchedAfterMount)
        return <div className={styles.container}>Fetching post...</div>;
    else if (axios.isAxiosError(error)) {
        return <div className={styles.container}>Could not fetch post</div>;
    } else if (!data) return <div className={styles.container}>no post</div>;
    return (
        <div className={styles.container}>
            <Post
                showSubreaditLink={false}
                postData={data}
                clickable={false}
                showCommentInput
            />
            <PostComments postId={data.id} />
        </div>
    );
};

const SubreaditPostComments = () => {
    return (
        <>
            <SubreaditTop redirectToSubreadit={true} />
            <PageContentWrapper>
                <SubreaditPostCommentsContent />
            </PageContentWrapper>
        </>
    );
};

export default SubreaditPostComments;
