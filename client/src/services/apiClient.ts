import axios, { AxiosRequestConfig } from 'axios';
import useUserStore from 'store/user';
import {
    firstRefreshRequestSent,
    getAccessToken,
    refreshAccessToken,
} from './auth';

const BASE_URL = '/api/';

export const axiosPublic = axios.create({
    headers: { 'Content-Type': 'application/json' },
    baseURL: BASE_URL,
    withCredentials: true,
});

export const axiosPrivate = axios.create({
    headers: { 'Content-Type': 'application/json' },
    baseURL: BASE_URL,
});

const setAuthorizationHeader = (req: AxiosRequestConfig<any>) => {
    const accessToken = getAccessToken();
    if (accessToken && req.headers) {
        const bearer = `Bearer ${accessToken}`;
        req.headers['Authorization'] = bearer;
    }
};

axiosPrivate.interceptors.request.use(
    (req) => {
        setAuthorizationHeader(req);
        return req;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//disable fetch when fetching user, refetching accessToken,

axiosPrivate.interceptors.response.use(
    (res) => res,
    async (error) => {
        const prevRequest = error?.config;
        const isAuth = !!useUserStore.getState().user;
        if (
            error?.response?.status === 401 &&
            !prevRequest._retry &&
            (!firstRefreshRequestSent || isAuth)
        ) {
            prevRequest._retry = true;
            await refreshAccessToken();
            return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
    }
);

export const getServerErrorResponse = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data as ErrorResponse;
    }
    return null;
};

export const getServerErrorResponseStatus = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        return error.response?.status;
    }

    return null;
};

interface ErrorResponse {
    error?: string;
}
