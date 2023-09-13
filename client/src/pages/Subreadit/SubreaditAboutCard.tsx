import { CreatePostButton, SidebarCard } from 'components';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import { useParams } from 'react-router-dom';
import { useGetSubreaditAbout } from 'services';
import useUserStore from 'store/user';
import { formatIsoDateToMonthDayYear } from 'utils';
import styles from './SubreaditAboutCard.module.scss';

const SubreaditAboutCardInfo = () => {
    const { subreaditName = '' } = useParams();
    const { isLoading, isError, data } = useGetSubreaditAbout(subreaditName);

    if (isLoading)
        return (
            <>
                <LoadingPlaceholder type="line" />
                <LoadingPlaceholder type="line5" />
            </>
        );
    if (isError || !data) return null;
    return (
        <>
            <div className={styles.about_line}>
                Created at {formatIsoDateToMonthDayYear(data.createdAt)}
            </div>
            <div className={styles.about_line}>
                {data.totalMembers} member{data.totalMembers === 1 ? '' : 's'}
            </div>
        </>
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
                <SubreaditAboutCardInfo />
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
