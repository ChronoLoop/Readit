import Button from 'components/Button';
import SidebarCard from './SidebarCard';
import styles from './HomeAboutCard.module.scss';
import { useCreateSubreaditModalStore } from 'store/modal';
import { useNavigate } from 'react-router-dom';
import useCreateSubreaditPostRoute from 'hooks/useCreateSubreaditPostRoute';
import useUserStore from 'store/user';

const HomeAboutCardCreateSubreaditButton = () => {
    const toggleShowCreateSubreaditModal = useCreateSubreaditModalStore(
        (s) => s.toggleShowCreateSubreaditModal
    );
    const isOpen = useCreateSubreaditModalStore(
        (s) => s.showCreateSubreaditModal
    );
    return (
        <Button
            variant="secondary"
            disabled={isOpen}
            onClick={() => {
                toggleShowCreateSubreaditModal();
            }}
        >
            Create Subreadit
        </Button>
    );
};

const HomeAboutCardCreatePostButton = () => {
    const navigate = useNavigate();
    const route = useCreateSubreaditPostRoute();
    return (
        <Button
            variant="primary"
            onClick={() => {
                navigate(route);
            }}
        >
            Create Post
        </Button>
    );
};

const HomeAboutCard = () => {
    const isAuth = useUserStore((s) => !!s.user);
    return (
        <SidebarCard heading={'Home'}>
            <SidebarCard.Section>
                Your personal Readit frontpage. Come here to check in with your
                favorite communities.
            </SidebarCard.Section>
            {isAuth && (
                <SidebarCard.Section>
                    <div className={styles.buttons}>
                        <HomeAboutCardCreatePostButton />
                        <HomeAboutCardCreateSubreaditButton />
                    </div>
                </SidebarCard.Section>
            )}
        </SidebarCard>
    );
};

export default HomeAboutCard;
