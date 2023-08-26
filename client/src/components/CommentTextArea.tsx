import { ComponentPropsWithoutRef, ReactNode } from 'react';
import cx from 'classnames';
import Breakline from './Breakline';
import Button from './Button';
import styles from './CommentTextArea.module.scss';
import TextArea from './TextArea';

interface CommentTextAreaProps {
    header?: ReactNode;
    disableTextArea?: boolean;
    disableSubmitButton?: boolean;
    textareaProps: ComponentPropsWithoutRef<'textarea'>;
    handleSubmit: () => void;
    error?: ReactNode;
    showLine?: boolean;
    isLoading?: boolean;
    className?: string;
}

const CommentTextArea = ({
    header,
    disableTextArea,
    disableSubmitButton,
    textareaProps,
    handleSubmit,
    showLine,
    isLoading,
    className,
}: CommentTextAreaProps) => {
    return (
        <>
            <div className={cx(styles.post_comment, className)}>
                {header && (
                    <h1 className={styles.post_comment_header}>{header}</h1>
                )}
                <form
                    className={styles.post_comment_form}
                    onSubmit={handleSubmit}
                >
                    <TextArea
                        disabled={disableTextArea}
                        className={styles.post_comment_text_area}
                        placeholder={'What are your thoughts?'}
                        {...textareaProps}
                    />
                    <div className={styles.post_comment_form_buttons}>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={disableSubmitButton}
                            showSpinner={isLoading}
                        >
                            Comment
                        </Button>
                    </div>
                </form>
            </div>
            {showLine && <Breakline className={styles.breakline} />}
        </>
    );
};

export default CommentTextArea;
