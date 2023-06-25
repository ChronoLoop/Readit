import { ContentError } from 'components';
import { FaSadTear } from 'react-icons/fa';

const UserEmptyContent = () => {
    return (
        <ContentError
            title={'Wow, such empty'}
            icon={<FaSadTear size={'100%'} />}
        />
    );
};

export default UserEmptyContent;
