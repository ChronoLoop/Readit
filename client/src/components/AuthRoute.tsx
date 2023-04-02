import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useUserStore from 'store/user';

interface AuthRouteProps {
    children: ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
    const isAuth = useUserStore((s) => !!s.user);
    if (!isAuth) return <Navigate to="/" replace />;
    return children;
};

export default AuthRoute;
