import { ComponentPropsWithoutRef } from 'react';
import cx from 'classnames';
import styles from './Icon.module.scss';

interface IconProps extends ComponentPropsWithoutRef<'i'> {}

const Icon = ({ className, children }: IconProps) => {
    return <i className={cx(className, styles.icon)}>{children}</i>;
};

export default Icon;
