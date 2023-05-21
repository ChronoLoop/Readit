import cx from 'classnames';
import styles from './Breakline.module.scss';

interface BreaklineProps {
    className?: string;
}

const Breakline = ({ className }: BreaklineProps) => {
    return <hr className={cx(styles.line, className)} />;
};

export default Breakline;
