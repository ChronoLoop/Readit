import { CreatePostButton, SidebarCard } from 'components';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import { useParams } from 'react-router-dom';
import { useGetSubreaditTotalUsers } from 'services';
import useUserStore from 'store/user';
import styles from './SubreaditAboutCard.module.scss';

const SubreaditAboutCardTotalUsers = () => {
    const { subreaditName = '' } = useParams();
    const { isLoading, isError, data } =
        useGetSubreaditTotalUsers(subreaditName);

    if (isLoading) return <LoadingPlaceholder type="line2" />;
    if (isError || !data) return null;
    return (
        <div className={styles.total_users}>
            {data.total} member{data.total === 1 ? '' : 's'}
        </div>
    );
};

const SubreaditAboutCard = () => {
    const { subreaditName = '' } = useParams();
    const isAuth = useUserStore((s) => !!s.user);

    if (!subreaditName) return null;

    return (
        <SidebarCard heading={'About Subreadit'}>
            <SidebarCard.Section>
                <div>Welcome to {subreaditName}</div>
                <SubreaditAboutCardTotalUsers />
            </SidebarCard.Section>
            {isAuth && (
                <SidebarCard.Section>
                    <CreatePostButton />
                </SidebarCard.Section>
            )}
        </SidebarCard>
    );
};

export default SubreaditAboutCard;
