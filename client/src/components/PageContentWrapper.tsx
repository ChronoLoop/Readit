import { ReactNode } from 'react';
import styles from './PageContentWrapper.module.scss';

interface PageContentWrapperProps {
    children: ReactNode;
}

const PageContentWrapper = ({ children }: PageContentWrapperProps) => {
    return <div className={styles.container}>{children}</div>;
};

export default PageContentWrapper;
