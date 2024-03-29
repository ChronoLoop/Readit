import {
    Button,
    Input,
    PageContentWrapper,
    TextArea,
    Dropdown,
} from 'components';
import z from 'zod';
import styles from './SubmitPost.module.scss';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TbCircleDashed } from 'react-icons/tb';
import { useCreateSubreaditPost, useGetUserSubreadits } from 'services';
import { useNavigate, useParams } from 'react-router-dom';
import SubreaditPlaceholderIcon from 'icons/SubreaditPlaceholderIcon';

const SubreaditPostSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    text: z.string().optional(),
    subreaditName: z.string().min(1, { message: 'Subreadit is required' }),
});

export type SubreaditPostFormType = z.infer<typeof SubreaditPostSchema>;

interface SelectPostSubreaditDropdownProps {
    setSubreaditName: (subreaditName: string) => void;
}

const SelectPostSubreaditDropdown = ({
    setSubreaditName,
}: SelectPostSubreaditDropdownProps) => {
    const { subreaditName } = useParams();

    //fetch user subreadits before opening dropdown
    const { data, isLoading } = useGetUserSubreadits();

    return (
        <Dropdown
            current={
                subreaditName
                    ? {
                          icon: <SubreaditPlaceholderIcon size="100%" />,
                          name: `r/${subreaditName}`,
                      }
                    : {
                          name: 'Choose a community',
                          icon: <TbCircleDashed size="100%" />,
                      }
            }
        >
            {({ toggleDropdown }) => (
                <>
                    <Dropdown.MenuSectionTitle>
                        Your Subreadits
                    </Dropdown.MenuSectionTitle>
                    {isLoading || !data
                        ? null
                        : data.map((userSubreadit) => {
                              return (
                                  <Dropdown.MenuItem
                                      key={userSubreadit.id}
                                      icon={
                                          <SubreaditPlaceholderIcon size="100%" />
                                      }
                                      to={`/r/${userSubreadit.subreaditName}/submit`}
                                      name={userSubreadit.subreaditName}
                                      onClick={() => {
                                          setSubreaditName(
                                              userSubreadit.subreaditName
                                          );
                                          toggleDropdown();
                                      }}
                                  />
                              );
                          })}
                </>
            )}
        </Dropdown>
    );
};

const CreatePostPage = () => {
    const { subreaditName } = useParams();
    const navigate = useNavigate();
    const {
        register,
        setValue,
        formState: { isValid },
        handleSubmit,
    } = useForm<SubreaditPostFormType>({
        mode: 'onChange',
        defaultValues: {
            subreaditName: subreaditName,
        },
        resolver: zodResolver(SubreaditPostSchema),
    });
    const { mutate, isLoading } = useCreateSubreaditPost({
        onSuccess: (response, variables) => {
            navigate(`/r/${variables.subreaditName}/comments/${response.id}`);
        },
    });

    const onSubmit: SubmitHandler<SubreaditPostFormType> = (data) => {
        mutate(data);
    };

    return (
        <PageContentWrapper
            content={
                <div className={styles.container}>
                    <h2>Create a post</h2>
                    <SelectPostSubreaditDropdown
                        setSubreaditName={(subreaditName) => {
                            setValue('subreaditName', subreaditName, {
                                shouldValidate: true,
                            });
                        }}
                    />
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            placeholder="Title"
                            variant="transparent"
                            {...register('title')}
                            disabled={isLoading}
                        />
                        <TextArea
                            placeholder="Text (optional)"
                            variant="transparent"
                            className={styles.textarea}
                            {...register('text')}
                            disabled={isLoading}
                        />
                        <hr />
                        <div className={styles.buttons_container}>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={!isValid || isLoading}
                                showSpinner={isLoading}
                            >
                                Post
                            </Button>
                        </div>
                    </form>
                </div>
            }
        />
    );
};

export default CreatePostPage;
