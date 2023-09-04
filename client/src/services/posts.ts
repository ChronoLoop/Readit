import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { axiosPrivate } from './apiClient';
import { useUserQuery } from './auth';
import useRequestErrorToast from './useRequestErrorToast';

export const POSTS_KEY = {
    all: ['posts'] as const,
    home: () => [...POSTS_KEY.all, 'home'] as const,
    subreadit: (subreaditName: string) =>
        [...POSTS_KEY.all, 'subreadit', subreaditName] as const,
    postId: (postId: number) => [...POSTS_KEY.all, 'post', postId] as const,
    readPost: (postId: number) =>
        [...POSTS_KEY.all, 'post', 'read', postId] as const,
    userRecentReadPosts: () =>
        [...POSTS_KEY.all, 'recent', 'read', 'home'] as const,
    userRecentReadSubreaditPosts: (subreaditName: string) =>
        [
            ...POSTS_KEY.all,
            'recent',
            'read',
            'subreadit',
            subreaditName,
        ] as const,
};

export type PostData = {
    id: number;
    title: string;
    totalVoteValue: number;
    text: string[];
    createAt: string;
    user?: {
        id: number;
        username: string;
    };
    subreadit: {
        id: number;
        name: string;
    };
    numberOfComments: number;
    userVote?: {
        value: number;
        userId: number;
    };
};

export interface CreateSubreaditPostData {
    title: string;
    text?: string;
    subreaditName: string;
}

export type GetPostsResponse = PostData[];

const getPosts = async () => {
    const response = await axiosPrivate.get<GetPostsResponse>('post');
    return response.data;
};

export const useGetHomePosts = () => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery(POSTS_KEY.home(), getPosts, {
        enabled: !isFetching,
    });
};

const getPostById = async (id: number) => {
    const response = await axiosPrivate.get<PostData>(`post/${id}`);
    return response.data;
};

export const useGetPostById = (
    id: number,
    options?: Omit<
        UseQueryOptions<PostData>,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery<PostData>(POSTS_KEY.postId(id), () => getPostById(id), {
        ...options,
        enabled: !isFetching,
        retry: 1,
    });
};

const getSubreaditPosts = async (subreaditName: string) => {
    const response = await axiosPrivate.get<GetPostsResponse>(
        `post?subreaditName=${subreaditName}`
    );
    return response.data;
};

export const useGetSubreaditPosts = (subreaditName: string) => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery(
        POSTS_KEY.subreadit(subreaditName),
        () => getSubreaditPosts(subreaditName),
        { enabled: !!subreaditName && !isFetching }
    );
};

type CreateSubreaditPostResponse = {
    id: number;
};

const createSubreaditPost = async (data: CreateSubreaditPostData) => {
    const response = await axiosPrivate.post<CreateSubreaditPostResponse>(
        'post/create',
        data
    );
    return response.data;
};

export const useCreateSubreaditPost = (
    options?: Omit<
        UseMutationOptions<
            CreateSubreaditPostResponse,
            unknown,
            CreateSubreaditPostData,
            unknown
        >,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    const { addToast, dismissToast } = useRequestErrorToast();

    return useMutation(
        (data: CreateSubreaditPostData) => {
            return createSubreaditPost(data);
        },
        {
            ...options,
            onError: (error, variables, context) => {
                addToast(
                    error,
                    'An error occured when submitting. Please try again.'
                );

                options?.onError?.(error, variables, context);
            },

            onSuccess: (data, variables, context) => {
                dismissToast();

                queryClient.invalidateQueries(POSTS_KEY.all);
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};

interface CheckUserReadPostResponse {
    createAt: string;
    userId: number;
    postId: number;
}

const checkUserReadPost = async (postId: number) => {
    const response = await axiosPrivate.get<CheckUserReadPostResponse>(
        `post/read/${postId}`
    );
    return response.data;
};

export const useCheckUserReadPost = (
    postId: number,
    options?: Omit<
        UseQueryOptions<CheckUserReadPostResponse>,
        'queryKey' | 'queryFn'
    >
) => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery<CheckUserReadPostResponse>(
        POSTS_KEY.readPost(postId),
        () => checkUserReadPost(postId),
        {
            ...options,
            retry: false,
            enabled: (options?.enabled ?? true) && !isFetching,
        }
    );
};

const createUserReadPost = async (postId: number) => {
    const response = await axiosPrivate.post<null>(`post/read/${postId}`);
    return response.data;
};

export const useCreateUserReadPost = (
    options?: Omit<
        UseMutationOptions<null, unknown, number, unknown>,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (postId: number) => {
            return createUserReadPost(postId);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                options?.onSuccess?.(data, variables, context);

                queryClient.invalidateQueries(POSTS_KEY.userRecentReadPosts());
            },
        }
    );
};

const deleteUserPost = async (postId: number) => {
    const response = await axiosPrivate.delete<null>(`post/${postId}`);
    return response.data;
};

export const useDeleteUserPost = (
    options?: Omit<
        UseMutationOptions<
            null,
            unknown,
            { postId: number; subreaditName: string },
            unknown
        >,
        'mutationFn'
    >
) => {
    const { addToast } = useRequestErrorToast();
    const queryClient = useQueryClient();
    return useMutation(
        ({ postId }) => {
            return deleteUserPost(postId);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                toast('Post has been deleted', {
                    position: 'bottom-center',
                    type: 'success',
                    autoClose: 5000,
                });

                queryClient.invalidateQueries(
                    POSTS_KEY.subreadit(variables.subreaditName)
                );

                queryClient.invalidateQueries(
                    POSTS_KEY.postId(variables.postId)
                );

                options?.onSuccess?.(data, variables, context);
            },
            onError: (error, variables, context) => {
                addToast(
                    error,
                    'An error occured when deleting. Please try again.'
                );

                options?.onError?.(error, variables, context);
            },
        }
    );
};

type GetUserRecentReadPostsResponse = PostData[];
const getUserRecentReadPosts = async () => {
    const response = await axiosPrivate.get<GetUserRecentReadPostsResponse>(
        'post/read/recent'
    );
    return response.data;
};

export const useGetUserRecentReadPosts = () => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery(POSTS_KEY.userRecentReadPosts(), getUserRecentReadPosts, {
        enabled: !isFetching,
    });
};

type GetUserRecentReadSubreaditPostsResponse = PostData[];
const getUserRecentReadSubreaditPosts = async (subreaditName: string) => {
    const response =
        await axiosPrivate.get<GetUserRecentReadSubreaditPostsResponse>(
            `post/read/recent?subreaditName=${subreaditName}`
        );
    return response.data;
};

export const useGetUserRecentReadSubreaditPosts = (
    subreaditName: string,
    options?: Omit<
        UseQueryOptions<GetUserRecentReadSubreaditPostsResponse>,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery<GetUserRecentReadSubreaditPostsResponse>(
        POSTS_KEY.userRecentReadSubreaditPosts(subreaditName),
        () => getUserRecentReadSubreaditPosts(subreaditName),
        {
            ...options,
            enabled: !isFetching,
        }
    );
};
