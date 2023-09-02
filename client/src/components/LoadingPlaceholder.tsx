import styles from './LoadingPlaceholder.module.scss';
import cx from 'classnames';

const STYLES = {
    line: styles.line,
    line2: cx(styles.line, styles.line_2),
    line5: cx(styles.line, styles.line_5),
    textblock: styles.text_block,
} as const;

type LoadingPlaceholderProps = {
    type: keyof typeof STYLES;
    className?: string;
};

const LoadingPlaceholder = ({ type, className }: LoadingPlaceholderProps) => {
    return <div className={cx(STYLES[type], className)} />;
};

export default LoadingPlaceholder;
