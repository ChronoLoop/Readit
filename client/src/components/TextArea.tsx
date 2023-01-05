import { forwardRef, ComponentPropsWithoutRef, ForwardedRef } from 'react';
import cx from 'classnames';

import styles from './TextArea.module.scss';

const variants = {
    transparent: styles.transparent,
} as const;

interface TextAreaProps extends ComponentPropsWithoutRef<'textarea'> {
    variant?: keyof typeof variants;
}

const TextArea = (
    { variant, className, ...props }: TextAreaProps,
    ref: ForwardedRef<HTMLTextAreaElement>
) => {
    return (
        <div className={styles.text_area_container}>
            <textarea
                {...props}
                className={cx(
                    styles.textarea,
                    variant && variants[variant],
                    className
                )}
                ref={ref}
            />
        </div>
    );
};

export default forwardRef(TextArea);
