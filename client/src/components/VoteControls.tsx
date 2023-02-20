import cx from 'classnames';
import useUserStore from 'store/user';
import { MouseEvent, useEffect, useState } from 'react';
import {
    TiArrowDownOutline,
    TiArrowUpOutline,
    TiArrowUpThick,
    TiArrowDownThick,
} from 'react-icons/ti';
import { Button } from 'components';
import styles from './VoteControls.module.scss';

interface PostVoteControlsProps {
    totalVoteValue: number;
    userVoteValue?: number;
    horizontal?: boolean;
    onChange: (val: number) => void;
}
const VoteControls = ({
    totalVoteValue,
    userVoteValue,
    horizontal = false,
    onChange,
}: PostVoteControlsProps) => {
    const isAuth = useUserStore((s) => s.user);
    const [currentUserVoteValue, setCurrentUserVoteValue] = useState(
        userVoteValue ?? 0
    );
    const [currentTotalVoteValue, setCurrentTotalVoteValue] =
        useState(totalVoteValue);

    const handleVote = (e: MouseEvent<HTMLButtonElement>, value: number) => {
        e.stopPropagation();

        if (!isAuth) return;

        if (currentUserVoteValue === 0) {
            setCurrentTotalVoteValue((prev) => prev + value);
            setCurrentUserVoteValue(value);
            onChange(value);
        } else if (value === currentUserVoteValue) {
            setCurrentTotalVoteValue((prev) => prev - value);
            setCurrentUserVoteValue(0);
            onChange(0);
        } else {
            setCurrentTotalVoteValue((prev) => prev + 2 * value);
            setCurrentUserVoteValue(value);
            onChange(value);
        }
    };

    useEffect(() => {
        setCurrentTotalVoteValue(totalVoteValue);
        setCurrentUserVoteValue(userVoteValue ?? 0);
    }, [totalVoteValue, userVoteValue]);

    return (
        <div
            className={cx(styles.vote, {
                [styles.vote_horizontal]: horizontal,
            })}
        >
            <Button
                className={styles.vote_btn}
                onClick={(e) => handleVote(e, 1)}
            >
                {currentUserVoteValue === 1 && isAuth ? (
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
                {currentUserVoteValue === -1 && isAuth ? (
                    <TiArrowDownThick className={styles.vote_arrow_fill} />
                ) : (
                    <TiArrowDownOutline className={styles.vote_arrow_unfill} />
                )}
            </Button>
        </div>
    );
};

export default VoteControls;
