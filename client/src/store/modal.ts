import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalStore {
    showCreateSubreaditModal: boolean;
    setShowCreateSubreaditModal: (show: boolean) => void;
    toggleShowCreateSubreaditModal: () => void;
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
    }))
);

const useModalStore = modalStore;

export default useModalStore;
