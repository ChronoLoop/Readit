import { Link, useNavigate, useParams } from 'react-router-dom';
import styles from './Nav.module.scss';
import AuthControls from './AuthControls';
import AuthMiddleware from 'middleware/AuthMiddleware';
import { Button } from 'components';
import { useSignOut } from 'services';
import NavigationDropdown from './NavigationDropdown';
import { FaPencilAlt } from 'react-icons/fa';
import { GoSignOut } from 'react-icons/go';

const CreatePostButton = () => {
    const navigate = useNavigate();
    const { subreaditName } = useParams();
    const route = subreaditName ? `r/${subreaditName}/submit` : '/submit';

    return (
        <Button
            onClick={() => {
                navigate(route);
            }}
        >
            <i className={styles.icon}>
                <FaPencilAlt />
            </i>
        </Button>
    );
};

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
                <NavigationDropdown />
                <div className={styles.auth}>
                    <AuthMiddleware notAuthContent={<AuthControls />}>
                        <CreatePostButton />
                        <Button onClick={handleSignOut} disabled={isLoading}>
                            <i className={styles.icon}>
                                <GoSignOut />
                            </i>
                        </Button>
                    </AuthMiddleware>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
