import { SignInFormType } from 'components/modals/SignInModal/SignInForm';
import { SignUpFormType } from 'components/modals/SignInModal/SignUpForm';
import useUserStore from 'store/user';
import {
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from 'react-query';
import { axiosPublic, axiosPrivate } from './apiClient';

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
}

export interface GetUserMeResponse {
    username: string;
    id: number;
}

export const refreshAccessToken = async () => {
    //using axiosPrivate will cause infinite loop in interceptors
    const response = await axiosPublic.get<RefreshAccessTokenResponse>(
        'user/refresh'
    );
    setAccessToken(response.data.accessToken);
};

const signIn = async (username: string, password: string) => {
    const response = await axiosPublic.post<SignInResponse>('user/signin', {
        username,
        password,
    });
    return response.data;
};

const signUp = async (username: string, password: string) => {
    const response = await axiosPublic.post<null>('user/register', {
        username,
        password,
    });
    return response.data;
};

const signOut = async () => {
    const response = await axiosPrivate.get<null>('user/signout');
    setAccessToken('');
    return response.data;
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
    const queryClient = useQueryClient();
    return useQuery<GetUserMeResponse>('auth-user', getUserMe, {
        ...options,
        retry: false,
        onSettled: () => {
            queryClient.invalidateQueries('posts');
        },
        onSuccess: (data) => {
            setUser(data);
        },
        onError: () => {
            setUser(null);
        },
    });
};

export const useSignOut = () => {
    const queryClient = useQueryClient();
    return useMutation(signOut, {
        onSuccess: () => {
            queryClient.invalidateQueries('auth-user');
            queryClient.invalidateQueries('post-vote');
            queryClient.invalidateQueries('post-comments');
            queryClient.resetQueries('user-subreadits');
        },
    });
};

export const useSignIn = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (data: SignInFormType) => signIn(data.username, data.password),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('auth-user');
                queryClient.invalidateQueries('post-vote');
                queryClient.invalidateQueries('post-comments');
            },
        }
    );
};

export const useSignUp = (options: { onSuccess: () => void }) => {
    return useMutation(
        (data: SignUpFormType) => signUp(data.username, data.password),
        {
            ...options,
        }
    );
};
