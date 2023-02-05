import cx from 'classnames';
import { Button } from 'components';
import SubreaditPlaceholderIcon from 'icons/SubreaditPlaceholderIcon';
import {
    getServerErrorResponseStatus,
    useGetSubreaditMe,
    useJoinSubreadit,
    useLeaveSubreadit,
} from 'services';
import { Link, useParams } from 'react-router-dom';
import styles from './SubreaditTop.module.scss';

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

interface SubreaditTopProps {
    redirectToSubreadit?: boolean;
}

const SubreaditTop = ({ redirectToSubreadit = false }: SubreaditTopProps) => {
    const { subreaditName } = useParams();
    return (
        <div className={styles.top_container}>
            <div className={cx(styles.background_placeholder)}>
                {redirectToSubreadit && (
                    <Link
                        className={styles.background_placeholder_link}
                        to={`/r/${subreaditName}`}
                    >
                        <SubreaditPlaceholderIcon
                            size={redirectToSubreadit ? '45' : '64'}
                        />
                        <h1>{'r/' + subreaditName}</h1>
                    </Link>
                )}
            </div>

            {!redirectToSubreadit && (
                <div className={styles.header}>
                    <div className={styles.header_main}>
                        <div className={styles.header_main_content}>
                            <SubreaditPlaceholderIcon />
                            <h1>{'r/' + subreaditName}</h1>
                            <SubreaditJoinLeaveButton />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubreaditTop;
