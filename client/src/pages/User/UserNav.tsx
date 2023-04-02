import cx from 'classnames';
import { ReactNode } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import styles from './UserNav.module.scss';

interface UserNavItemProps {
    to: string;
    children: ReactNode;
}

const UserNavItem = ({ to, children }: UserNavItemProps) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cx(styles.nav_item, { [styles.nav_item_active]: isActive })
            }
            end
        >
            {children}
        </NavLink>
    );
};

const UserNav = () => {
    const { username = '' } = useParams();

    return (
        <div className={cx(styles.nav)}>
            <UserNavItem to={`/u/${username}`}>Overview</UserNavItem>
            <UserNavItem to="posts">Posts</UserNavItem>
            <UserNavItem to="comments">Comments</UserNavItem>
        </div>
    );
};

export default UserNav;
