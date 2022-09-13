import { axiosPublic } from './apiClient';

interface Post {
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
}

type GetPostsResponse = Post[];

export const getPosts = async () => {
    const response = await axiosPublic.get<GetPostsResponse>('post');
    return response.data;
};
