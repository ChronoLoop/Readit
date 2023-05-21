import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { axiosPrivate } from './apiClient';
import { useUserQuery } from './auth';
import { PostComments } from './comment';
import { PostData } from './posts';

export const PROFILE_KEY = {
    all: ['profile'] as const,
    overview: (username: string) =>
        [...PROFILE_KEY.all, username, 'overview'] as const,
};

interface UserOverviewPostsWithComments {
    post: PostData;
    userComments: PostComments;
}

type GetUserProfileOverviewResponse = UserOverviewPostsWithComments[];

const getUserProfileOverview = async (username: string) => {
    const response = await axiosPrivate.get<GetUserProfileOverviewResponse>(
        `profile/overview/${username}`
    );
    return response.data;
};

export const useGetUserProfileOverview = (
    username: string,
    options?: Omit<
        UseQueryOptions<GetUserProfileOverviewResponse>,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    return useQuery<GetUserProfileOverviewResponse>(
        PROFILE_KEY.overview(username),
        () => getUserProfileOverview(username),
        {
            ...options,
            enabled: !!username && !isFetching,
        }
    );
};
