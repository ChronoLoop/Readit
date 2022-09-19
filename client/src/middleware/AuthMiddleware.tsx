import { ReactNode } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { getUserMe } from '@/services';
import useUserStore from '@/store/user';

interface AuthMiddlewareProps {
    children: ReactNode;
    notAuthContent?: ReactNode;
    loadingContent?: ReactNode;
}

const AuthMiddleware = ({
    children,
    loadingContent,
    notAuthContent,
}: AuthMiddlewareProps) => {
    const setUser = useUserStore((s) => s.setUser);
    const queryClient = useQueryClient();
    const { isFetching, isError } = useQuery('auth-user', getUserMe, {
        retry: false,
        onSuccess: (data) => {
            setUser(data);
            queryClient.invalidateQueries('posts');
        },
        onError: () => {
            setUser(null);
            queryClient.invalidateQueries('posts');
        },
    });

    if (isFetching) {
        return <>{loadingContent}</>;
    } else if (isError && notAuthContent) {
        return <>{notAuthContent}</>;
    }

    return <>{children}</>;
};

export default AuthMiddleware;
