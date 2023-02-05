import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from 'react-query';
import { axiosPrivate } from './apiClient';
import { useUserQuery } from './auth';

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
                queryClient.invalidateQueries(['post-vote', postId]);
                options?.onSuccess?.(data, variables, context);
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
                queryClient.invalidateQueries(['post-comment-vote', commentId]);
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};

interface VoteResponse {
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

const getPostCommentVote = async (commentId: number) => {
    const response = await axiosPrivate.get<VoteResponse>(
        `vote/comment?id=${commentId}`
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
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery<VoteResponse>(
        ['post-vote', postId],
        () => getPostVote(postId),
        {
            ...options,
            enabled: !!postId && !isFetching,
        }
    );
};

export const useGetPostCommentVote = (
    postCommentId: number,

    options?: Omit<
        UseQueryOptions<VoteResponse>,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    return useQuery<VoteResponse>(
        ['post-comment-vote', postCommentId],
        () => getPostCommentVote(postCommentId),
        { ...options, enabled: !!postCommentId }
    );
};
