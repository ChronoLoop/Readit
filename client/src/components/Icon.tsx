import { ComponentPropsWithoutRef } from 'react';
import cx from 'classnames';
import styles from './Icon.module.scss';

const ICON_SIZES = {
    sm: styles.icon_sm,
    md: styles.icon_md,
    lg: styles.icon_lg,
};

type IconProps = ComponentPropsWithoutRef<'i'> & {
    size?: keyof typeof ICON_SIZES;
};

const Icon = ({ className, children, size = 'sm' }: IconProps) => {
    return <i className={cx(className, ICON_SIZES[size])}>{children}</i>;
};

export default Icon;
