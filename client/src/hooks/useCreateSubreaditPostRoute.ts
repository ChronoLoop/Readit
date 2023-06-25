import { useParams } from 'react-router-dom';

const useCreateSubreaditPostRoute = () => {
    const { subreaditName } = useParams();
    const route = subreaditName ? `/r/${subreaditName}/submit` : '/submit';

    return route;
};

export default useCreateSubreaditPostRoute;
