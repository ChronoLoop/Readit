import axios from 'axios';
import cx from 'classnames';
import { Post, PageContentWrapper, ContentError } from 'components';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getServerErrorResponse, useGetSubreaditPost } from 'services';
import styles from './SubreaditPostComments.module.scss';
import SubreaditTop from './SubreaditTop';

const SubreaditPostCommentsContent = () => {
    const { postId = '' } = useParams();
    const { data, isLoading, error } = useGetSubreaditPost(parseInt(postId));

    if (isLoading) return <div className={styles.container} />;
    else if (axios.isAxiosError(error)) {
        const errorMessage = getServerErrorResponse(error)?.error;
        return (
            <div className={cx(styles.container, styles.error)}>
                <ContentError
                    icon={<FaExclamationTriangle size={'100%'} />}
                    title={errorMessage}
                />
            </div>
        );
    } else if (!data)
        return (
            <div className={cx(styles.container, styles.error)}>
                <ContentError
                    icon={<FaExclamationTriangle size={'100%'} />}
                    title="Could not find post"
                />
            </div>
        );

    return (
        <div className={styles.container}>
            <Post showSubreaditLink={false} postData={data} showCommentInput />
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
