import { ReactNode } from 'react';
import cx from 'classnames';
import styles from './PageContentWrapper.module.scss';

type PageContentWrapperProps = {
    content: ReactNode;
    sidebar?: ReactNode;
    className?: string;
};

const PageContentWrapper = ({
    className,
    content,
    sidebar,
}: PageContentWrapperProps) => {
    return (
        <div className={cx(styles.container, className)}>
            <div className={cx(styles.column, styles.column_1)}>{content}</div>
            {sidebar && (
                <div className={cx(styles.column, styles.column_2)}>
                    {sidebar}
                </div>
            )}
        </div>
    );
};

export default PageContentWrapper;
