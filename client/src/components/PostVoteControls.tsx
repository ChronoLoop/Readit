import { PostData, useGetPostVote, useSendPostVote } from 'services';
import VoteControls from './VoteControls';

interface PostVoteControlsProps {
    totalVoteValue: number;
    postId: number;
    userVote?: PostData['userVote'];
}
const PostVoteControls = ({
    totalVoteValue,
    postId,
    userVote,
}: PostVoteControlsProps) => {
    const { mutate } = useSendPostVote(postId);

    const { data } = useGetPostVote(postId, {
        initialData: {
            id: postId,
            totalVoteValue: totalVoteValue,
            userVote: userVote,
        },
        staleTime: Infinity,
    });

    return (
        <VoteControls
            onChange={mutate}
            totalVoteValue={data?.totalVoteValue ?? totalVoteValue}
            userVoteValue={data?.userVote?.value ?? 0}
        />
    );
};

export default PostVoteControls;
