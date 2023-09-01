import { PostData } from 'services';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type CreateSubreaditModalStore = {
    showCreateSubreaditModal: boolean;
    setShowCreateSubreaditModal: (show: boolean) => void;
    toggleShowCreateSubreaditModal: () => void;
};

export const useCreateSubreaditModalStore = create<CreateSubreaditModalStore>()(
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

type PostModalStore = {
    closePostModal: () => void;
    setPostModal: (postData: PostData, scrollToComments: boolean) => void;
    postModalPostId: number | null;
    prevLocation: string;
    scrollToComments: boolean;
};

export const usePostModalStore = create<PostModalStore>()(
    devtools((set) => ({
        //subreadit post comment
        prevLocation: '',
        postModalPostId: null,
        scrollToComments: false,
        closePostModal: () => {
            set(({ prevLocation }) => {
                if (prevLocation) {
                    window.history.replaceState(null, '', prevLocation);
                }
                return {
                    postModalPostId: null,
                    prevLocation: '',
                    scrollToComments: false,
                };
            });
        },
        setPostModal: (postData, scrollToComments) => {
            set(() => {
                const prevLocation = window.location.href;
                window.history.replaceState(
                    null,
                    '',
                    `/r/${postData.subreadit.name}/comments/${postData.id}`
                );
                return {
                    prevLocation: prevLocation,
                    postModalPostId: postData.id,
                    scrollToComments,
                };
            });
        },
    }))
);
