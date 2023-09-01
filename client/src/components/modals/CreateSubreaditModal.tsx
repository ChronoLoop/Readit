import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useCreateSubreadit } from 'services';
import { z } from 'zod';
import styles from './CreateSubreaditModal.module.scss';
import { Input, Button, ModalFrame, ModalFormWrapper } from 'components';
import { useNavigate } from 'react-router-dom';
import { useCreateSubreaditModalStore } from 'store/modal';

const SubreaditSchema = z.object({
    name: z
        .string()
        .min(3, { message: 'Subreadit name must have at least 3 characters' })
        .max(20, {
            message: 'Subreadit name cannot have more than 20 characters',
        }),
});

type SubreaditFormType = z.infer<typeof SubreaditSchema>;

const CreateSubreaditModal = () => {
    const { showCreateSubreaditModal, toggleShowCreateSubreaditModal } =
        useCreateSubreaditModalStore();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { isValid, errors },
    } = useForm<SubreaditFormType>({
        mode: 'onChange',
        resolver: zodResolver(SubreaditSchema),
    });

    const { mutate, isLoading } = useCreateSubreadit({
        onSuccess: (_, submittedData) => {
            toggleShowCreateSubreaditModal();
            navigate(`/r/${submittedData.name}`);
        },
    });

    const onSubmit: SubmitHandler<SubreaditFormType> = (data) => {
        mutate(data);
    };

    if (!showCreateSubreaditModal) return null;

    return (
        <ModalFrame
            header={'Create a subreadit'}
            handleCloseModal={toggleShowCreateSubreaditModal}
        >
            <ModalFormWrapper handleSubmit={handleSubmit(onSubmit)}>
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
