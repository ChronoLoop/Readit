import { ReactNode } from 'react';
import cx from 'classnames';
import styles from './CardWrapper.module.scss';

interface CardWrapperProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    paddingTopRightBottom?: boolean;
    padding?: boolean;
}

const CardWrapper = ({
    children,
    onClick,
    className,
    paddingTopRightBottom,
    padding,
}: CardWrapperProps) => {
    return (
        <div
            className={cx(styles.container, className, {
                [styles.container_padding_top_right_bottom]:
                    paddingTopRightBottom,
                [styles.container_padding]: padding,
                [styles.container_no_hover]: !onClick,
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
