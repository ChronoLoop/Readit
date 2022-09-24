import { useMutation } from 'react-query';
import { axiosPrivate } from './apiClient';

const sendPostVote = async (id: number, value: number) => {
    const response = await axiosPrivate.post<null>('vote/post', { value, id });
    return response.data;
};

export const useSendPostVote = (postId: number) => {
    return useMutation((value: number) => {
        return sendPostVote(postId, value);
    });
};
