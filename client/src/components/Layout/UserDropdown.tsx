import { FaUserCircle } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
const UserDropdown = () => {
    return (
        <button id="user-dropdown-id">
            <FaUserCircle size={'1.4rem'} />
            <FiChevronDown size={'1.2rem'} />
        </button>
    );
};

export default UserDropdown;
