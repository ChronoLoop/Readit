import { Link } from 'react-router-dom';
import styles from './Nav.module.scss';
import AuthControls from './AuthControls';
import AuthMiddleware from '@/middleware/AuthMiddleware';
import { Button } from '../Button';
import { useMutation, useQueryClient } from 'react-query';
import { signOut } from '@/services';

const Navbar = () => {
    const queryClient = useQueryClient();
    const { isLoading, mutate } = useMutation(signOut, {
        onSuccess: () => {
            queryClient.invalidateQueries('auth-user');
        },
    });

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
