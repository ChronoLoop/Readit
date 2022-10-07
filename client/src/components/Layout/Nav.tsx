import { Link } from 'react-router-dom';
import styles from './Nav.module.scss';
import AuthControls from './AuthControls';
import AuthMiddleware from 'middleware/AuthMiddleware';
import { Button } from 'components';
import { useSignOut } from 'services';
import SubreaditDropdown from './SubreaditDropdown';

const Navbar = () => {
    const { isLoading, mutate } = useSignOut();
    const handleSignOut = () => {
        mutate();
    };

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <Link to={'/'} className={styles.brand}>
                    Readit
                </Link>
                <AuthMiddleware notAuthContent={<AuthControls />}>
                    <SubreaditDropdown />
                    <Button
                        onClick={handleSignOut}
                        variant="primary"
                        disabled={isLoading}
                    >
                        Sign Out
                    </Button>
                </AuthMiddleware>
            </nav>
        </header>
    );
};

export default Navbar;
