import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useUserStore from 'store/user';
import z from 'zod';
import { axiosPrivate } from './apiClient';
import { useUserQuery } from './auth';
import { POSTS_KEY } from './posts';
import { PROFILE_KEY } from './profile';
import useRequestErrorToast from './useRequestErrorToast';

export const PostCommentSchema = z.object({
    postId: z.number(),
    text: z
        .string()
        .min(1, { message: 'input must have at least 1 character' }),
    parentId: z.number().optional(),
});

export type CreatePostCommentData = z.infer<typeof PostCommentSchema>;

type CreatePostcommentResponse = {
    commentId: number;
};

const createSubreaditPostComment = async (data: CreatePostCommentData) => {
    const response = await axiosPrivate.post<CreatePostcommentResponse>(
        'comment/create',
        data
    );
    return response.data;
};

export const useCreateSubreaditPostComment = (
    options?: Omit<
        UseMutationOptions<
            CreatePostcommentResponse,
            unknown,
            CreatePostCommentData,
            unknown
        >,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    const { addToast, dismissToast } = useRequestErrorToast();

    return useMutation(
        (data: CreatePostCommentData) => {
            return createSubreaditPostComment(data);
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

                queryClient.invalidateQueries(
                    POST_COMMENT_KEY.postId(variables.postId)
                );
                queryClient.invalidateQueries(
                    POSTS_KEY.postId(variables.postId)
                );
                const username = useUserStore.getState().user?.username;
                if (username) {
                    queryClient.invalidateQueries(
                        PROFILE_KEY.overview(username)
                    );
                }
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};

export const POST_COMMENT_KEY = {
    all: ['post-comments'] as const,
    postId: (postId: number) => [...POST_COMMENT_KEY.all, postId] as const,
};

interface PostComment {
    id: number;
    totalVoteValue: number;
    text: string;
    createAt: string;
    user?: {
        id: number;
        username: string;
    };
    parentId: number | null;
    userVote?: {
        value: number;
        userId: number;
    };
    postId: number;
}

export type PostComments = PostComment[];

export const getPostComments = async (postId: number) => {
    const response = await axiosPrivate.get<PostComments>(
        `comment?postId=${postId}`
    );
    return response.data;
};

export const useGetPostComments = (postId: number) => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery(
        POST_COMMENT_KEY.postId(postId),
        () => getPostComments(postId),
        {
            enabled: !!postId && !isFetching,
        }
    );
};

const deleteUserComment = async (commentId: number) => {
    const response = await axiosPrivate.delete<null>(`comment/${commentId}`);
    return response.data;
};

export const useDeleteUserComment = (
    options?: Omit<
        UseMutationOptions<
            null,
            unknown,
            { commendId: number; postId: number; username: string },
            unknown
        >,
        'mutationFn'
    >
) => {
    const { addToast } = useRequestErrorToast();
    const queryClient = useQueryClient();
    return useMutation(
        ({ commendId }) => {
            return deleteUserComment(commendId);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                toast('Comment has been deleted', {
                    position: 'bottom-center',
                    type: 'success',
                    autoClose: 5000,
                });
                queryClient.invalidateQueries(
                    POSTS_KEY.postId(variables.postId)
                );
                queryClient.invalidateQueries(
                    POST_COMMENT_KEY.postId(variables.postId)
                );
                queryClient.invalidateQueries(
                    PROFILE_KEY.overview(variables.username)
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
