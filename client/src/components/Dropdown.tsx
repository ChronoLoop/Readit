import useOnClickOutside from 'hooks/useOnClickOutside';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { CgChevronDown } from 'react-icons/cg';
import cx from 'classnames';
import Button from './Button';
import styles from './Dropdown.module.scss';
import Icon from './Icon';
import { Link, LinkProps } from 'react-router-dom';

interface DropdownMenuSectionTitleProps {
    children: ReactNode;
}

const DropdownMenuSectionTitle = ({
    children,
}: DropdownMenuSectionTitleProps) => {
    return (
        <h4 className={cx(styles.menu_heading, styles.menu_item)}>
            {children}
        </h4>
    );
};

interface DropdownMenuItemProps {
    onClick: () => void;
    icon: ReactNode;
    to?: string;
    name: ReactNode;
    state?: LinkProps['state'];
}

const DropdownMenuItem = ({
    to,
    onClick,
    icon,
    name,
    state,
}: DropdownMenuItemProps) => {
    if (to)
        return (
            <Link
                to={to}
                role="menuitem"
                className={styles.menu_item}
                onClick={onClick}
                state={state}
            >
                <Icon>{icon}</Icon>
                <span className={styles.menu_item_text}>{name}</span>
            </Link>
        );

    return (
        <Button
            onClick={onClick}
            className={styles.menu_item}
            center={false}
            role={'menuitem'}
        >
            <Icon>{icon}</Icon>
            <span className={styles.menu_item_text}>{name}</span>
        </Button>
    );
};

interface DropdownCurrent {
    name: ReactNode;
    icon: ReactNode;
}

interface DropdownChildrenProps {
    toggleDropdown: () => void;
}

interface DropdownProps {
    current: DropdownCurrent;
    children: (props: DropdownChildrenProps) => ReactNode;
}

const Dropdown = ({ current, children }: DropdownProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    useOnClickOutside(
        dropdownRef,
        useCallback(() => {
            setIsDropdownOpen(false);
        }, [])
    );

    return (
        <div className={styles.container} role={'navigation'} ref={dropdownRef}>
            <Button
                className={cx(styles.button, {
                    [styles.button_open]: isDropdownOpen,
                })}
                onClick={toggleDropdown}
                variant="border"
            >
                <Icon className={styles.icon_main}>{current.icon}</Icon>
                <span className={styles.title}>{current.name}</span>
                <Icon className={styles.icon_caret}>
                    <CgChevronDown size="100%" />
                </Icon>
            </Button>
            {isDropdownOpen && (
                <div role={'menu'} className={styles.menu}>
                    {children({ toggleDropdown })}
                </div>
            )}
        </div>
    );
};

Dropdown.MenuItem = DropdownMenuItem;
Dropdown.MenuSectionTitle = DropdownMenuSectionTitle;

export default Dropdown;
