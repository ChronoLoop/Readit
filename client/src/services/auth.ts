import { SignInFormType } from 'components/modals/SignInModal/SignInForm';
import { SignUpFormType } from 'components/modals/SignInModal/SignUpForm';
import useUserStore from 'store/user';
import {
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';
import { axiosPublic, axiosPrivate } from './apiClient';
import { POST_COMMENT_VOTE_KEYS, POST_VOTE_KEYS } from './vote';
import { POST_COMMENT_KEY } from './comment';
import { POSTS_KEY } from './posts';
import { SUBREADIT_KEYS } from './subreadit';
import { PROFILE_KEY } from './profile';

let accessToken = '';

export const setAccessToken = (s: string) => {
    accessToken = s;
};

export const getAccessToken = () => {
    return accessToken;
};

interface RefreshAccessTokenResponse {
    accessToken: string;
}

export interface SignInResponse {
    accessToken: string;
    user: GetUserMeResponse;
}

export interface GetUserMeResponse {
    username: string;
    id: number;
}

export let firstRefreshRequestSent = false;

export const refreshAccessToken = async () => {
    //using axiosPrivate will cause infinite loop in interceptors
    try {
        firstRefreshRequestSent = true;
        const response = await axiosPublic.get<RefreshAccessTokenResponse>(
            'user/refresh'
        );
        setAccessToken(response.data.accessToken);
    } catch (err) {
        useUserStore.setState({ user: null });
        throw err;
    }
};

const AUTH_USER_KEY = {
    all: ['auth-user'] as const,
};

const getUserMe = async () => {
    const response = await axiosPrivate.get<GetUserMeResponse>('user/me');
    return response.data;
};

export const useUserQuery = (
    options?: Omit<
        UseQueryOptions<GetUserMeResponse>,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    const setUser = useUserStore((s) => s.setUser);
    const isAuth = useUserStore((s) => !!s.user);

    return useQuery<GetUserMeResponse>(AUTH_USER_KEY.all, getUserMe, {
        ...options,
        retry: false,
        onSuccess: (data) => {
            setUser(data);
        },
        onError: () => {
            setUser(null);
        },
        enabled: !firstRefreshRequestSent || !!accessToken || isAuth,
    });
};

const signOut = async () => {
    const response = await axiosPrivate.get<null>('user/signout');
    setAccessToken('');
    return response.data;
};

export const useSignOut = () => {
    const queryClient = useQueryClient();
    const setUser = useUserStore((s) => s.setUser);
    return useMutation(signOut, {
        onSuccess: () => {
            setUser(null);
            queryClient.invalidateQueries(AUTH_USER_KEY.all);
            queryClient.invalidateQueries(POSTS_KEY.all);
            queryClient.invalidateQueries(POST_COMMENT_KEY.all);
            queryClient.invalidateQueries(POST_VOTE_KEYS.all);
            queryClient.invalidateQueries(POST_COMMENT_VOTE_KEYS.all);
            queryClient.invalidateQueries(SUBREADIT_KEYS.all);
            queryClient.invalidateQueries(PROFILE_KEY.all);
        },
    });
};

const signIn = async (username: string, password: string) => {
    const response = await axiosPublic.post<SignInResponse>('user/signin', {
        username,
        password,
    });
    setAccessToken(response.data.accessToken);
    return response.data;
};

export const useSignIn = () => {
    const queryClient = useQueryClient();
    const setUser = useUserStore((s) => s.setUser);
    return useMutation(
        (data: SignInFormType) => signIn(data.username, data.password),
        {
            onSuccess: (res) => {
                setUser(res.user);
                queryClient.invalidateQueries(AUTH_USER_KEY.all);
                queryClient.invalidateQueries(POSTS_KEY.all);
                queryClient.invalidateQueries(POST_VOTE_KEYS.all);
                queryClient.invalidateQueries(POST_COMMENT_VOTE_KEYS.all);
                queryClient.invalidateQueries(POST_COMMENT_KEY.all);
                queryClient.invalidateQueries(SUBREADIT_KEYS.all);
                queryClient.invalidateQueries(PROFILE_KEY.all);
            },
        }
    );
};

const signUp = async (username: string, password: string) => {
    const response = await axiosPublic.post<null>('user/register', {
        username,
        password,
    });
    return response.data;
};

export const useSignUp = (options: { onSuccess: () => void }) => {
    return useMutation(
        (data: SignUpFormType) => signUp(data.username, data.password),
        {
            ...options,
        }
    );
};
