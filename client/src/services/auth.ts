import { axiosPublic, axiosPrivate } from './apiClient';

let accessToken = '';

const setAccessToken = (s: string) => {
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

export const signIn = async (username: string, password: string) => {
    const response = await axiosPublic.post<SignInResponse>('user/signin', {
        username,
        password,
    });
    return response.data;
};

export const signUp = async (username: string, password: string) => {
    const response = await axiosPublic.post('user/register', {
        username,
        password,
    });
    return response.data;
};

export const signOut = async () => {
    const response = await axiosPrivate.get('user/signout');
    setAccessToken('');
    return response.data;
};

export const getUserMe = async () => {
    const response = await axiosPrivate.get<GetUserMeResponse>('user/me');
    return response.data;
};
