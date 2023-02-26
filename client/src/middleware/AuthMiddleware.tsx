import { ReactNode } from 'react';

import { useUserQuery } from 'services';
import useUserStore from 'store/user';

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
    const isAuth = useUserStore((s) => !!s.user);
    const { isFetching } = useUserQuery();

    if (isFetching) {
        return <>{loadingContent}</>;
    } else if (notAuthContent && !isAuth) {
        return <>{notAuthContent}</>;
    }

    return <>{children}</>;
};

export default AuthMiddleware;
