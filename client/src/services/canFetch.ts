import { useUserQuery } from 'services';

const useCanFetch = () => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });

    return !isFetching;
};

export default useCanFetch;
