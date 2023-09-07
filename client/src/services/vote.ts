import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';
import useCanFetch from './canFetch';
import { axiosPrivate } from './apiClient';

export const POST_VOTE_KEYS = {
    all: ['post-vote'] as const,
    postId: (postId: number) => [...POST_VOTE_KEYS.all, postId] as const,
};

export const POST_COMMENT_VOTE_KEYS = {
    all: ['post-comment-vote'] as const,
    commentId: (commentId: number) =>
        [...POST_COMMENT_VOTE_KEYS.all, commentId] as const,
};

const sendPostVote = async (id: number, value: number) => {
    const response = await axiosPrivate.post<null>('vote/post', { value, id });
    return response.data;
};

export const useSendPostVote = (
    postId: number,
    options?: Omit<
        UseMutationOptions<null, unknown, number, unknown>,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (value: number) => {
            return sendPostVote(postId, value);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                options?.onSuccess?.(data, variables, context);
            },
            onSettled: () => {
                queryClient.invalidateQueries(POST_VOTE_KEYS.postId(postId));
            },
        }
    );
};

const sendPostCommentVote = async (id: number, value: number) => {
    const response = await axiosPrivate.post<null>('vote/comment', {
        value,
        id,
    });
    return response.data;
};

export const useSendPostCommentVote = (
    commentId: number,
    options?: Omit<
        UseMutationOptions<null, unknown, number, unknown>,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (value: number) => {
            return sendPostCommentVote(commentId, value);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                options?.onSuccess?.(data, variables, context);
            },
            onSettled: () => {
                queryClient.invalidateQueries(
                    POST_COMMENT_VOTE_KEYS.commentId(commentId)
                );
            },
        }
    );
};

export interface VoteResponse {
    totalVoteValue: number;
    id: number;
    userVote?: {
        value: number;
        userId: number;
    };
}

const getPostVote = async (postId: number) => {
    const response = await axiosPrivate.get<VoteResponse>(
        `vote/post?id=${postId}`
    );
    return response.data;
};

export const useGetPostVote = (
    postId: number,
    options?: Omit<
        UseQueryOptions<VoteResponse>,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    const canFetch = useCanFetch();
    return useQuery<VoteResponse>(
        POST_VOTE_KEYS.postId(postId),
        () => getPostVote(postId),
        {
            ...options,
            enabled: !!postId && canFetch,
        }
    );
};

const getPostCommentVote = async (commentId: number) => {
    const response = await axiosPrivate.get<VoteResponse>(
        `vote/comment?id=${commentId}`
    );
    return response.data;
};

export const useGetPostCommentVote = (
    postCommentId: number,

    options?: Omit<
        UseQueryOptions<VoteResponse>,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    const canFetch = useCanFetch();

    return useQuery<VoteResponse>(
        POST_COMMENT_VOTE_KEYS.commentId(postCommentId),
        () => getPostCommentVote(postCommentId),
        { ...options, enabled: !!postCommentId && canFetch }
    );
};
