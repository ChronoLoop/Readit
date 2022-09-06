import { Outlet } from 'react-router-dom';
import styles from './Layout.module.scss';
import Nav from './Nav';

const Layout = () => {
    return (
        <div className={styles.wrapper}>
            <Nav />
            <div className={styles.main}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
