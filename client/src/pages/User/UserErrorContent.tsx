import { AxiosError } from 'axios';
import { ContentError } from 'components';
import { FaExclamationTriangle } from 'react-icons/fa';
import { getServerErrorResponse } from 'services';

type UserErrorContentProps = {
    error: AxiosError<any, any>;
};
const UserErrorContent = ({ error }: UserErrorContentProps) => {
    const errorMessage = getServerErrorResponse(error)?.error;
    return (
        <ContentError
            icon={<FaExclamationTriangle size={'100%'} />}
            title={errorMessage}
        />
    );
};

export default UserErrorContent;
