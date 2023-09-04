import axios from 'axios';
import { Post, PageContentWrapper, ContentError } from 'components';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { getServerErrorResponse, useGetPostById } from 'services';
import styles from './SubreaditPostComments.module.scss';
import SubreaditTop from './SubreaditTop';

const SubreaditPostCommentsContentLoading = () => {
    return (
        <div className={styles.loading}>
            <LoadingPlaceholder type="line2" />
            <LoadingPlaceholder type="line5" />
            <LoadingPlaceholder type="textblock" />
            <LoadingPlaceholder type="line2" />
        </div>
    );
};

const SubreaditPostCommentsContent = () => {
    const { postId = '' } = useParams();
    const { data, isLoading, error } = useGetPostById(parseInt(postId));

    const navigate = useNavigate();

    if (isLoading)
        return (
            <div className={styles.container}>
                <SubreaditPostCommentsContentLoading />
            </div>
        );
    else if (axios.isAxiosError(error)) {
        const errorMessage = getServerErrorResponse(error)?.error;
        return (
            <div className={styles.error}>
                <ContentError
                    icon={<FaExclamationTriangle size={'100%'} />}
                    title={errorMessage}
                />
            </div>
        );
    } else if (!data)
        return (
            <ContentError
                icon={<FaExclamationTriangle size={'100%'} />}
                title="Could not find post"
            />
        );

    return (
        <div className={styles.container}>
            <Post
                showSubreaditLink={false}
                postData={data}
                showCommentInput
                onDelete={() => {
                    navigate(`/r/${data.subreadit.name}`);
                }}
            />
        </div>
    );
};

const SubreaditPostComments = () => {
    return (
        <>
            <SubreaditTop redirectToSubreadit={true} />
            <PageContentWrapper content={<SubreaditPostCommentsContent />} />
        </>
    );
};

export default SubreaditPostComments;
