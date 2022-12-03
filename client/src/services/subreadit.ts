import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
} from 'react-query';
import useUserStore from 'store/user';
import { axiosPrivate } from './apiClient';

interface CreateSubreaditData {
    name: string;
}

interface UserSubreadit {
    id: number;
    username: string;
    role: string;
    subreaditName: string;
}

type GetUserSubreaditsData = UserSubreadit[];

const createSubreadit = async (data: CreateSubreaditData) => {
    const response = await axiosPrivate.post<null>('subreadit/create', data);
    return response.data;
};

const getUserSubreadits = async () => {
    const response = await axiosPrivate.get<GetUserSubreaditsData>(
        'subreadit/'
    );
    return response.data;
};

export const useCreateSubreadit = (
    options: Omit<
        UseMutationOptions<null, unknown, CreateSubreaditData, unknown>,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (data: CreateSubreaditData) => {
            return createSubreadit(data);
        },
        {
            ...options,
            onSuccess: () => {
                queryClient.invalidateQueries('user-subreadits');
            },
        }
    );
};

export const useGetUserSubreadits = () => {
    const isAuth = useUserStore((s) => s.user);
    return useQuery('user-subreadits', getUserSubreadits, {
        retry: false,
        enabled: !!isAuth,
    });
};
