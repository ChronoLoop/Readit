import { ReactNode } from 'react';
import styles from './SidebarWrapper.module.scss';

interface SidebarWrapperProps {
    children: ReactNode;
}

const SidebarWrapper = ({ children }: SidebarWrapperProps) => {
    return <div className={styles.sidebar}>{children}</div>;
};

export default SidebarWrapper;
