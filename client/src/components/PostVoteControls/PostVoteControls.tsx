import { useSendPostVote } from '@/services';
import useUserStore from '@/store/user';
import { MouseEvent, useState } from 'react';
import {
    TiArrowDownOutline,
    TiArrowUpOutline,
    TiArrowUpThick,
    TiArrowDownThick,
} from 'react-icons/ti';
import { Button } from '../Button';
import styles from './PostVoteControls.module.scss';

interface PostVoteControlsProps {
    totalVoteValue: number;
    postId: number;
    userVoteValue?: number;
}
const PostVoteControls = ({
    totalVoteValue,
    postId,
    userVoteValue,
}: PostVoteControlsProps) => {
    const isAuth = useUserStore((s) => s.user);
    const [currentUserVoteValue, setCurrentUserVoteValue] = useState(
        userVoteValue ?? 0
    );
    const [currentTotalVoteValue, setCurrentTotalVoteValue] =
        useState(totalVoteValue);

    const { mutate } = useSendPostVote(postId);

    const handleVote = (e: MouseEvent<HTMLButtonElement>, value: number) => {
        e.stopPropagation();

        if (!isAuth) return;

        if (currentUserVoteValue === 0) {
            setCurrentTotalVoteValue((prev) => prev + value);
            setCurrentUserVoteValue(value);
            mutate(value);
        } else if (value === currentUserVoteValue) {
            setCurrentTotalVoteValue((prev) => prev - value);
            setCurrentUserVoteValue(0);
            mutate(0);
        } else {
            setCurrentTotalVoteValue((prev) => prev + 2 * value);
            setCurrentUserVoteValue(value);
            mutate(value);
        }
    };

    return (
        <div className={styles.vote}>
            <Button
                className={styles.vote_btn}
                onClick={(e) => handleVote(e, 1)}
            >
                {currentUserVoteValue === 1 ? (
                    <TiArrowUpThick className={styles.vote_arrow_fill} />
                ) : (
                    <TiArrowUpOutline className={styles.vote_arrow_unfill} />
                )}
            </Button>
            {currentTotalVoteValue}
            <Button
                className={styles.vote_btn}
                onClick={(e) => handleVote(e, -1)}
            >
                {currentUserVoteValue === -1 ? (
                    <TiArrowDownThick className={styles.vote_arrow_fill} />
                ) : (
                    <TiArrowDownOutline className={styles.vote_arrow_unfill} />
                )}
            </Button>
        </div>
    );
};

export default PostVoteControls;
