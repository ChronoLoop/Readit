import { FaHome } from 'react-icons/fa';
import { HiPlus } from 'react-icons/hi';
import { useParams } from 'react-router-dom';
import SubreaditPlaceholderIcon from 'icons/SubreaditPlaceholderIcon';
import { useGetUserSubreadits } from 'services';
import Dropdown from 'components/Dropdown';
import useModalStore from 'store/modal';

interface ToggleDropdownProps {
    toggleDropdown: () => void;
}

const NavigationYourSubreadits = ({ toggleDropdown }: ToggleDropdownProps) => {
    const { data } = useGetUserSubreadits();

    if (!data) {
        return null;
    }

    return (
        <>
            <Dropdown.MenuSectionTitle>
                Your Subreadits
            </Dropdown.MenuSectionTitle>
            <CreateSubreaditButton toggleDropdown={toggleDropdown} />
            {data.map((userSubreadit) => (
                <Dropdown.MenuItem
                    key={userSubreadit.id}
                    icon={<SubreaditPlaceholderIcon size="100%" />}
                    to={`/r/${userSubreadit.subreaditName}`}
                    name={userSubreadit.subreaditName}
                    onClick={toggleDropdown}
                />
            ))}
        </>
    );
};

const NavigationFeeds = ({ toggleDropdown }: ToggleDropdownProps) => {
    return (
        <>
            <Dropdown.MenuSectionTitle>Feeds</Dropdown.MenuSectionTitle>
            <Dropdown.MenuItem
                icon={<FaHome size="100%" />}
                name="Home"
                to="/"
                onClick={toggleDropdown}
            />
        </>
    );
};

const CreateSubreaditButton = ({ toggleDropdown }: ToggleDropdownProps) => {
    const { toggleShowCreateSubreaditModal } = useModalStore();

    return (
        <>
            <Dropdown.MenuItem
                onClick={() => {
                    toggleShowCreateSubreaditModal();
                    toggleDropdown();
                }}
                icon={<HiPlus size={'100%'} />}
                name="Create Subreadit"
            />
        </>
    );
};

const NavigationDropdown = () => {
    const { subreaditName } = useParams();

    //fetch user subreadits before opening dropdown
    useGetUserSubreadits();

    return (
        <Dropdown
            current={
                subreaditName
                    ? {
                          icon: <SubreaditPlaceholderIcon size="100%" />,
                          name: `r/${subreaditName}`,
                      }
                    : { icon: <FaHome size={'100%'} />, name: 'Home' }
            }
        >
            {({ toggleDropdown }) => (
                <>
                    <NavigationYourSubreadits toggleDropdown={toggleDropdown} />
                    <NavigationFeeds toggleDropdown={toggleDropdown} />
                </>
            )}
        </Dropdown>
    );
};

export default NavigationDropdown;
