import { useQuery } from 'react-query';
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

export const useGetHomePosts = () => {
    const { isFetching } = useUserQuery();
    return useQuery(['posts', 'home'], getPosts, {
        enabled: !isFetching,
    });
};

export const useGetSubreaditPosts = (subreaditName: string) => {
    const { isFetching } = useUserQuery();

    return useQuery(
        ['posts', 'subreadit', subreaditName],
        () => getSubreaditPosts(subreaditName),
        { enabled: !!subreaditName && !isFetching }
    );
};
