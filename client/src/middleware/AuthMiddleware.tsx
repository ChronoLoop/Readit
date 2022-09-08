import { ReactNode } from 'react';
import { useQuery } from 'react-query';

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
    const { isLoading, isError } = useQuery('auth-user', getUserMe, {
        retry: false,
        onSuccess: (data) => {
            setUser(data);
        },
        onError: () => {
            setUser(null);
        },
    });

    if (isLoading) {
        return <>{loadingContent}</>;
    } else if (isError) {
        return <>{notAuthContent}</>;
    }

    return <>{children}</>;
};

export default AuthMiddleware;
