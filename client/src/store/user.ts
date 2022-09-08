import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { GetUserMeResponse } from '@/api';

type User = GetUserMeResponse;

interface UserStore {
    user: User | null;
    setUser: (user: User) => void;
}

const userStore = create<UserStore>()(
    devtools((set) => ({
        user: null,
        setUser: (user) => set(() => ({ user })),
    }))
);

const useUserStore = userStore;

export default useUserStore;
