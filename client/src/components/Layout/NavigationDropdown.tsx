import { ReactNode, useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import Button from 'components/Button';
import CreateSubreaditModal from 'components/CreateSubreaditModal';
import styles from './NavigationDropdown.module.scss';

import { FaHome } from 'react-icons/fa';
import { CgChevronDown } from 'react-icons/cg';
import { HiPlus } from 'react-icons/hi';
import { Link, useMatch } from 'react-router-dom';
import SubreaditPlaceholderIcon from 'icons/SubreaditPlaceholderIcon';
import { useGetUserSubreadits } from 'services';
import useOnClickOutside from 'hooks/useOnClickOutside';

interface ToggleDropdownProps {
    toggleDropdown: () => void;
}

interface SubreaditDropdownCurrentLocationTitleProps {
    children: ReactNode;
}

const NavigationCurrentLocationTitle = ({
    children,
}: SubreaditDropdownCurrentLocationTitleProps) => {
    return <span className={styles.title}>{children}</span>;
};

const NavigationHomeFeed = () => {
    return (
        <>
            <i className={cx(styles.icon, styles.icon_main)}>
                <FaHome size="100%" />
            </i>
            <NavigationCurrentLocationTitle>
                Home
            </NavigationCurrentLocationTitle>
        </>
    );
};

const NavigationCurrentLocation = () => {
    const match = useMatch('r/:subreaditName');

    if (match) {
        return (
            <>
                <i className={cx(styles.icon, styles.icon_main)}>
                    <SubreaditPlaceholderIcon size="100%" />
                </i>
                <NavigationCurrentLocationTitle>
                    r/{match.params.subreaditName}
                </NavigationCurrentLocationTitle>
            </>
        );
    }

    return <NavigationHomeFeed />;
};

const NavigationYourSubreadits = ({ toggleDropdown }: ToggleDropdownProps) => {
    const { data } = useGetUserSubreadits();

    if (!data) {
        return null;
    }

    return (
        <>
            <h4 className={cx(styles.menu_heading, styles.menu_item)}>
                Your Subreadits
            </h4>
            <CreateSubreaditButton />
            {data.map((userSubreadit) => (
                <NavigationMenuItemLink
                    key={userSubreadit.id}
                    icon={<SubreaditPlaceholderIcon size="100%" />}
                    to={`r/${userSubreadit.subreaditName}`}
                    text={userSubreadit.subreaditName}
                    toggleDropdown={toggleDropdown}
                />
            ))}
        </>
    );
};

const NavigationFeeds = ({ toggleDropdown }: ToggleDropdownProps) => {
    return (
        <>
            <h4 className={cx(styles.menu_heading, styles.menu_item)}>Feeds</h4>
            <NavigationMenuItemLink
                icon={<FaHome size="100%" />}
                text="Home"
                to="/"
                toggleDropdown={toggleDropdown}
            />
        </>
    );
};

const CreateSubreaditButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };
    return (
        <>
            <Button
                onClick={toggleModal}
                className={styles.menu_item}
                center={false}
                role={'menuitem'}
            >
                <i className={styles.icon}>
                    <HiPlus size={'100%'} />
                </i>
                <span className={styles.menu_item_text}>Create Subreadit</span>
            </Button>
            {isModalOpen && (
                <CreateSubreaditModal handleCloseModal={toggleModal} />
            )}
        </>
    );
};

interface NavigationMenuItemLinkProps {
    to: string;
    icon: ReactNode;
    text: ReactNode;
}

const NavigationMenuItemLink = ({
    to,
    icon,
    text,
    toggleDropdown,
}: NavigationMenuItemLinkProps & ToggleDropdownProps) => {
    return (
        <Link
            to={to}
            role="menuitem"
            className={styles.menu_item}
            onClick={toggleDropdown}
        >
            <i className={styles.icon}>{icon}</i>
            <span className={styles.menu_item_text}>{text}</span>
        </Link>
    );
};

const NavigationMenu = ({ toggleDropdown }: ToggleDropdownProps) => {
    return (
        <div role={'menu'} className={styles.menu}>
            <NavigationYourSubreadits toggleDropdown={toggleDropdown} />
            <NavigationFeeds toggleDropdown={toggleDropdown} />
        </div>
    );
};

const NavigationDropdown = () => {
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

    //fetch user subreadits before opening dropdown
    useGetUserSubreadits();

    return (
        <div className={styles.container} role={'navigation'} ref={dropdownRef}>
            <Button
                className={cx(styles.button, {
                    [styles.button_open]: isDropdownOpen,
                })}
                onClick={toggleDropdown}
                variant="border"
            >
                <NavigationCurrentLocation />
                <i className={cx(styles.icon, styles.icon_caret)}>
                    <CgChevronDown size="100%" />
                </i>
            </Button>
            {isDropdownOpen && (
                <NavigationMenu toggleDropdown={toggleDropdown} />
            )}
        </div>
    );
};

export default NavigationDropdown;
