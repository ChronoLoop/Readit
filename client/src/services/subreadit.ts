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

const getSubreaditMe = async (subreaditName: string) => {
    const response = await axiosPrivate.get<UserSubreadit>(
        `subreadit/me?subreaditName=${subreaditName}`
    );
    return response.data;
};

const joinSubreadit = async (subreaditName: string) => {
    const response = await axiosPrivate.post<null>('subreadit/join', {
        subreaditName,
    });
    return response.data;
};

const leaveSubreadit = async (subreaditName: string) => {
    const response = await axiosPrivate.delete<null>('subreadit/leave', {
        data: {
            subreaditName,
        },
    });
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
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries('user-subreadits');
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};

export const useJoinSubreadit = (
    options?: Omit<
        UseMutationOptions<null, unknown, string, unknown>,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (subreaditName: string) => {
            return joinSubreadit(subreaditName);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries(['subreadit-me', variables]);
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};

export const useLeaveSubreadit = (
    options?: Omit<
        UseMutationOptions<null, unknown, string, unknown>,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (subreaditName: string) => {
            return leaveSubreadit(subreaditName);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                queryClient.resetQueries(['subreadit-me', variables]);
                options?.onSuccess?.(data, variables, context);
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

export const useGetSubreaditMe = (subreaditName: string) => {
    const isAuth = useUserStore((s) => s.user);
    return useQuery(
        ['subreadit-me', subreaditName],
        () => getSubreaditMe(subreaditName),
        {
            retry: false,
            enabled: !!isAuth,
        }
    );
};
