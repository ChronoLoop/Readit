import { axiosPrivate } from './apiClient';

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
    subreddit: {
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

export const getPosts = async () => {
    const response = await axiosPrivate.get<GetPostsResponse>('post');
    return response.data;
};

export const getSubredditPosts = async (subredditName: string) => {
    const response = await axiosPrivate.get<GetPostsResponse>(
        `post?subredditName=${subredditName}`
    );
    return response.data;
};
