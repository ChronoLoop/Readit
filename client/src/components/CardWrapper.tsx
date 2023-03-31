import { ReactNode } from 'react';
import cx from 'classnames';
import styles from './CardWrapper.module.scss';

interface CardWrapperProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    disableHover?: boolean;
}

const CardWrapper = ({
    children,
    onClick,
    className,
    disableHover,
}: CardWrapperProps) => {
    return (
        <div
            className={cx(styles.container, className, {
                [styles.container_no_hover]: disableHover,
            })}
            onClick={() => {
                onClick?.();
            }}
        >
            {children}
        </div>
    );
};

export default CardWrapper;
