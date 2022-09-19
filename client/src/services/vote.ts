import { axiosPrivate } from './apiClient';

interface GetPostVoteResponse {
    userId: number;
    value: number;
}

export const sendPostVote = async (id: number, value: number) => {
    const response = await axiosPrivate.post<null>('vote/post', { value, id });
    return response.data;
};

export const getPostVote = async (id: number) => {
    const response = await axiosPrivate.get<GetPostVoteResponse>(
        `vote/post?id=${id}`
    );
    return response.data;
};
