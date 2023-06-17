import { ComponentProps, ReactNode } from 'react';
import cx from 'classnames';
import styles from './ContentError.module.scss';
import Icon from './Icon';
import Button from './Button';

type ContentErrorTitleMessageProps =
    | {
          title: ReactNode;
          message: ReactNode;
      }
    | { title: ReactNode; message?: never };

type ContentErrorButtonProps =
    | {
          buttonText: ReactNode;
          buttonCallback: ComponentProps<typeof Button>['onClick'];
      }
    | {
          buttonText?: never;
          buttonCallback?: never;
      };

type ContentErrorProps = {
    icon?: ReactNode;
    iconSize?: ComponentProps<typeof Icon>['size'];
    buttonCallback?: Function;
    className?: string;
} & ContentErrorTitleMessageProps &
    ContentErrorButtonProps;

const CONTAINER_STYLES: {
    [key in Exclude<ContentErrorProps['iconSize'], undefined>]: string;
} = {
    sm: styles.container_sm,
    md: styles.container_md,
    lg: styles.container_lg,
};

const ContentError = ({
    icon,
    title,
    message,
    buttonCallback,
    buttonText,
    iconSize = 'md',
    className,
}: ContentErrorProps) => {
    return (
        <div
            className={cx(
                className,
                styles.container,
                CONTAINER_STYLES[iconSize]
            )}
        >
            {icon && (
                <Icon className={styles.icon} size={iconSize}>
                    {icon}
                </Icon>
            )}
            <h1 className={cx(styles.title)}>{title}</h1>
            {message && <p className={cx(styles.message)}>{message}</p>}
            {buttonCallback && buttonText && (
                <Button onClick={buttonCallback} variant="primary">
                    {buttonText}
                </Button>
            )}
        </div>
    );
};

export default ContentError;
