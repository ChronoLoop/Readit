import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import useUserStore from 'store/user';
import { axiosPrivate } from './apiClient';

export const SUBREADIT_KEYS = {
    all: ['user-subreadits'] as const,
    subreaditMe: (subreaditName: string) =>
        [...SUBREADIT_KEYS.all, 'subreadit-me', subreaditName] as const,
};

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
                queryClient.invalidateQueries(SUBREADIT_KEYS.all);
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};

const joinSubreadit = async (subreaditName: string) => {
    const response = await axiosPrivate.post<null>('subreadit/join', {
        subreaditName,
    });
    return response.data;
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
                queryClient.invalidateQueries(
                    SUBREADIT_KEYS.subreaditMe(variables)
                );
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};

const leaveSubreadit = async (subreaditName: string) => {
    const response = await axiosPrivate.delete<null>('subreadit/leave', {
        data: {
            subreaditName,
        },
    });
    return response.data;
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
                queryClient.resetQueries(SUBREADIT_KEYS.subreaditMe(variables));
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};

const getUserSubreadits = async () => {
    const response = await axiosPrivate.get<GetUserSubreaditsData>(
        'subreadit/'
    );
    return response.data;
};

export const useGetUserSubreadits = () => {
    const isAuth = useUserStore((s) => !!s.user);
    return useQuery(SUBREADIT_KEYS.all, getUserSubreadits, {
        retry: false,
        enabled: isAuth,
    });
};

const getSubreaditMe = async (subreaditName: string) => {
    const response = await axiosPrivate.get<UserSubreadit>(
        `subreadit/me?subreaditName=${subreaditName}`
    );
    return response.data;
};

export const useGetSubreaditMe = (subreaditName: string) => {
    const isAuth = useUserStore((s) => s.user);
    return useQuery(
        SUBREADIT_KEYS.subreaditMe(subreaditName),
        () => getSubreaditMe(subreaditName),
        {
            retry: false,
            enabled: !!isAuth,
        }
    );
};
