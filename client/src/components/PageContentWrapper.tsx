import { ReactNode } from 'react';
import cx from 'classnames';
import styles from './PageContentWrapper.module.scss';

interface PageContentWrapperProps {
    children: ReactNode;
    className?: string;
}

const PageContentWrapper = ({
    children,
    className,
}: PageContentWrapperProps) => {
    return <div className={cx(styles.container, className)}>{children}</div>;
};

export default PageContentWrapper;
