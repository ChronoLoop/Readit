import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './auth';

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

axiosPrivate.interceptors.request.use(
    (req) => {
        if (req.headers) {
            const accessToken = getAccessToken();
            const bearer = `Bearer ${accessToken}`;
            req.headers['Authorization'] = bearer;
        }
        return req;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosPrivate.interceptors.response.use(
    (res) => res,
    async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest._retry) {
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

interface ErrorResponse {
    error?: string;
}
