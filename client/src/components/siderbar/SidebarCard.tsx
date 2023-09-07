import CardWrapper from 'components/CardWrapper';
import styles from './SidebarCard.module.scss';
import { MouseEventHandler, ReactNode } from 'react';
import cx from 'classnames';

type SidebarCardSectionProps = {
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLDivElement>;
    className?: string;
};

const SidebarCardSection = ({
    children,
    onClick,
    className,
}: SidebarCardSectionProps) => {
    return (
        <div className={cx(styles.section, className)} onClick={onClick}>
            {children}
        </div>
    );
};

type SidebarCardProps = {
    heading: ReactNode;
    mutedHeading?: boolean;
    children: ReactNode;
};

const SidebarCard = ({
    heading,
    mutedHeading = true,
    children,
}: SidebarCardProps) => {
    return (
        <CardWrapper padding>
            <h2
                className={cx(styles.heading, {
                    [styles.heading_muted]: mutedHeading,
                })}
            >
                {heading}
            </h2>
            {children}
        </CardWrapper>
    );
};

SidebarCard.Section = SidebarCardSection;
export default SidebarCard;
