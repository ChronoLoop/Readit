import useCreateSubreaditPostRoute from 'hooks/useCreateSubreaditPostRoute';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const CreatePostButton = () => {
    const navigate = useNavigate();
    const route = useCreateSubreaditPostRoute();
    return (
        <Button
            variant="primary"
            onClick={() => {
                navigate(route);
            }}
        >
            Create Post
        </Button>
    );
};

export default CreatePostButton;
