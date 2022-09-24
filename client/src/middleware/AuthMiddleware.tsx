import { ReactNode } from 'react';

import { useUserQuery } from '@/services';

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
    const { isFetching, isError } = useUserQuery();

    if (isFetching) {
        return <>{loadingContent}</>;
    } else if (isError && notAuthContent) {
        return <>{notAuthContent}</>;
    }

    return <>{children}</>;
};

export default AuthMiddleware;
