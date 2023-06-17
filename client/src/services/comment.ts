import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import useUserStore from 'store/user';
import z from 'zod';
import { axiosPrivate } from './apiClient';
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

const createSubreaditPostComment = async (data: CreatePostCommentData) => {
    const response = await axiosPrivate.post('comment/create', data);
    return response.data;
};

export const useCreateSubreaditPostComment = (
    options?: Omit<
        UseMutationOptions<null, unknown, CreatePostCommentData, unknown>,
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
    user: {
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
    return useQuery(
        POST_COMMENT_KEY.postId(postId),
        () => getPostComments(postId),
        {
            enabled: !!postId,
        }
    );
};
