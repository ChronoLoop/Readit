import Button from 'components/Button';
import { useCreateSubreaditModalStore } from 'store/modal';
import useUserStore from 'store/user';
import { CreatePostButton, SidebarCard } from 'components';

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
                    <CreatePostButton />
                    <HomeAboutCardCreateSubreaditButton />
                </SidebarCard.Section>
            )}
        </SidebarCard>
    );
};

export default HomeAboutCard;
