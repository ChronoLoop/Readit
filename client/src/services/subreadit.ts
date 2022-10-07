import { useMutation, UseMutationOptions } from 'react-query';
import { axiosPrivate } from './apiClient';

interface CreateSubreaditData {
    name: string;
}

const createSubreadit = async (data: CreateSubreaditData) => {
    const response = await axiosPrivate.post<null>('subreadit/create', data);
    return response.data;
};

export const useCreateSubreadit = (
    options: Omit<
        UseMutationOptions<null, unknown, CreateSubreaditData, unknown>,
        'mutationFn'
    >
) => {
    return useMutation((data: CreateSubreaditData) => {
        return createSubreadit(data);
    }, options);
};
