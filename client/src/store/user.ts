import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GetUserMeResponse } from 'services';

type User = GetUserMeResponse;

interface UserStore {
    user: User | null;
    setUser: (user: User | null) => void;
    isRefreshingAccessToken: boolean;
    setIsRefreshingAccessToken: (bool: boolean) => void;
}

const userStore = create<UserStore>()(
    devtools((set) => ({
        user: null,
        isRefreshingAccessToken: false,
        setUser: (user) => set(() => ({ user })),
        setIsRefreshingAccessToken: (bool: boolean) =>
            set(() => ({ isRefreshingAccessToken: bool })),
    }))
);

const useUserStore = userStore;

export default useUserStore;
