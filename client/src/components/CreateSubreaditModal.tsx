import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getServerErrorResponse, useCreateSubreadit } from 'services';
import { z } from 'zod';
import styles from './CreateSubreaditModal.module.scss';
import Input from './Input';
import Button from './Button';
import ModalFrame from './ModalFrame';
import ModalFormWrapper from './ModalFormWrapper';
import { useNavigate } from 'react-router-dom';

interface CreateSubreaditModalProps {
    handleCloseModal: () => void;
}

const SubreaditSchema = z.object({
    name: z
        .string()
        .min(3, { message: 'Subreadit name must have at least 3 characters' })
        .max(20, {
            message: 'Subreadit name cannot have more than 20 characters',
        }),
});

type SubreaditFormType = z.infer<typeof SubreaditSchema>;

const CreateSubreaditModal = ({
    handleCloseModal,
}: CreateSubreaditModalProps) => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { isValid, errors },
    } = useForm<SubreaditFormType>({
        mode: 'onChange',
        resolver: zodResolver(SubreaditSchema),
    });

    const { mutate, isLoading, isError, error } = useCreateSubreadit({
        onSuccess: (_, submittedData) => {
            handleCloseModal();
            navigate(`/r/${submittedData.name}`);
        },
    });

    const onSubmit: SubmitHandler<SubreaditFormType> = (data) => {
        mutate(data);
    };

    return (
        <ModalFrame
            header={'Create a subreadit'}
            handleCloseModal={handleCloseModal}
        >
            <ModalFormWrapper
                error={
                    isError &&
                    (getServerErrorResponse(error)?.error ||
                        'An error occured when submitting. Please try again.')
                }
                handleSubmit={handleSubmit(onSubmit)}
            >
                <Input
                    id={'name'}
                    {...register('name')}
                    labelContent="Subreadit Name"
                    disabled={isLoading}
                    error={errors.name?.message}
                />
                <Button
                    variant="primary"
                    type="submit"
                    disabled={!isValid || isLoading}
                    showSpinner={isLoading}
                    className={styles.button}
                >
                    Create Subreadit
                </Button>
            </ModalFormWrapper>
        </ModalFrame>
    );
};

export default CreateSubreaditModal;
