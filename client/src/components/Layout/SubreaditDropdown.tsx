import Button from 'components/Button';
import CreateSubreaditModal from 'components/CreateSubreaditModal';
import { useState } from 'react';

const SubreaditDropdown = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    return (
        <>
            <Button onClick={toggleModal} variant="secondary">
                Create Subreadit
            </Button>
            {isModalOpen && (
                <CreateSubreaditModal handleCloseModal={toggleModal} />
            )}
        </>
    );
};

export default SubreaditDropdown;
