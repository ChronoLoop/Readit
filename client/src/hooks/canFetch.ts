import { useUserQuery } from 'services';
import useUserStore from 'store/user';

const useCanFetch = () => {
    const { isFetching } = useUserQuery({ refetchOnMount: false });
    const isRefreshingAccessToken = useUserStore(
        (s) => s.isRefreshingAccessToken
    );

    return !isFetching && !isRefreshingAccessToken;
};

export default useCanFetch;
