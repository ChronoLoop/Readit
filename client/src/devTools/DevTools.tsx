import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Button } from 'components';
import { setAccessToken } from 'services';
import styles from './DevTools.module.scss';

const DevTools = () => {
    return (
        <>
            <ReactQueryDevtools />
            <div className={styles.container}>
                <Button onClick={() => setAccessToken('')}>
                    empty access token
                </Button>
            </div>
        </>
    );
};

export default DevTools;
