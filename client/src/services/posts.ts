import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from 'react-query';
import { axiosPrivate } from './apiClient';
import { useUserQuery } from './auth';

export interface PostData {
    id: number;
    title: string;
    totalVoteValue: number;
    text: string;
    createAt: string;
    user: {
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
}

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

const getSubreaditPosts = async (subreaditName: string) => {
    const response = await axiosPrivate.get<GetPostsResponse>(
        `post?subreaditName=${subreaditName}`
    );
    return response.data;
};
const getSubreaditPost = async (id: number) => {
    const response = await axiosPrivate.get<PostData>(`post/${id}`);
    return response.data;
};

const createSubreaditPost = async (data: CreateSubreaditPostData) => {
    const response = await axiosPrivate.post('post/create', data);
    return response.data;
};

export const useGetHomePosts = () => {
    const { isFetching } = useUserQuery();
    return useQuery(['posts', 'home'], getPosts, { enabled: !isFetching });
};

export const useGetSubreaditPost = (
    id: number,
    options?: Omit<
        UseQueryOptions<PostData>,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery<PostData>(
        ['post', 'subreadit', id],
        () => getSubreaditPost(id),
        {
            ...options,
            enabled: !isFetching,
        }
    );
};

export const useGetSubreaditPosts = (subreaditName: string) => {
    const { isFetching } = useUserQuery();
    return useQuery(
        ['posts', 'subreadit', subreaditName],
        () => getSubreaditPosts(subreaditName),
        { enabled: !!subreaditName && !isFetching }
    );
};

export const useCreateSubreaditPost = (
    options?: Omit<
        UseMutationOptions<null, unknown, CreateSubreaditPostData, unknown>,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (data: CreateSubreaditPostData) => {
            return createSubreaditPost(data);
        },
        {
            ...options,
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries('posts');
                options?.onSuccess?.(data, variables, context);
            },
        }
    );
};
