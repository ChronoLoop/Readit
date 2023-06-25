import { PostData } from 'services';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalStore {
    showCreateSubreaditModal: boolean;
    setShowCreateSubreaditModal: (show: boolean) => void;
    toggleShowCreateSubreaditModal: () => void;

    //subreadit post comment
    closeSubreaditPostModal: () => void;
    setSubreaditPostModal: (postData: PostData | null) => void;
    subreaditPostModalPostId: number | null;
    prevLocation: string;
}

const modalStore = create<ModalStore>()(
    devtools((set) => ({
        showCreateSubreaditModal: false,
        setShowCreateSubreaditModal: (show) =>
            set(() => ({ showCreateSubreaditModal: show })),
        toggleShowCreateSubreaditModal: () =>
            set(({ showCreateSubreaditModal }) => {
                return { showCreateSubreaditModal: !showCreateSubreaditModal };
            }),

        //subreadit post comment
        prevLocation: '',
        subreaditPostModalPostId: null,
        closeSubreaditPostModal: () => {
            set(({ prevLocation }) => {
                if (prevLocation) {
                    window.history.replaceState(null, '', prevLocation);
                }
                return { subreaditPostModalPostId: null, prevLocation: '' };
            });
        },
        setSubreaditPostModal: (postData) => {
            set(({ prevLocation }) => {
                if (postData) {
                    window.history.replaceState(
                        null,
                        '',
                        `/r/${postData.subreadit.name}/comments/${postData.id}`
                    );
                    return {
                        prevLocation: window.location.href,
                    };
                }
                window.history.replaceState(null, '', prevLocation);
                return {
                    subreaditPostModalPostId: null,
                    prevLocation: '',
                };
            });
        },
    }))
);

const useModalStore = modalStore;

export default useModalStore;
