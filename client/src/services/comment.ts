import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
} from 'react-query';
import z from 'zod';
import { axiosPrivate } from './apiClient';

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
    return useMutation(
        (data: CreatePostCommentData) => {
            return createSubreaditPostComment(data);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries([
                    'post-comments',
                    variables.postId,
                ]);
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
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
    return useQuery(['post-comments', postId], () => getPostComments(postId), {
        enabled: !!postId,
    });
};
