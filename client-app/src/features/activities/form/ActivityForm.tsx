import {Button, Header, Segment} from "semantic-ui-react";
import React, {useEffect, useState} from "react";
import {useStore} from "../../../app/stores/store";
import {observer} from "mobx-react-lite";
import {Link, useNavigate, useParams} from "react-router-dom";
import {ActivityFormValues} from "../../../app/models/activity";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import {v4 as uuid} from 'uuid';
import {ErrorMessage, Form, Formik} from "formik";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import {categoryOptions} from "../../../app/common/options/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";
import ValidationError from "../../Error/ValidationError";

function ActivityForm() {

    const {activityStore} = useStore();
    const {createActivity, updateActivity, loadActivity, loadingInitial} = activityStore;
    const {id} = useParams();
    const navigate = useNavigate();

    const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());

    // const validationSchema = Yup.object({
    //     title: Yup.string().required('The activity title is required'),
    //     category: Yup.string().required('The activity category is required'),
    //     description: Yup.string().required('The activity description is required'),
    //     city: Yup.string().required('The activity city is required'),
    //     venue: Yup.string().required('The activity venue is required'),
    //     date: Yup.date().required('The date is required').nullable(),
    // });

    useEffect(() => {
        if (id) loadActivity(id).then(activity => setActivity(new ActivityFormValues(activity)));
    }, [id, loadActivity]);

    function handleFormSubmit(activity: ActivityFormValues, setErrors: any) {
        if (!activity.id) {
            let newActivity = {
                ...activity,
                id: uuid()
            }
            createActivity(newActivity).then(() => navigate(`/activities/${newActivity.id}`)).catch(err => setErrors({error: err}));
        } else {
            updateActivity(activity).then(() => navigate(`/activities/${activity.id}`)).catch(err => setErrors({error: err}));
        }
    }


    if (loadingInitial) return <LoadingComponent content={'Loading activity...'}/>

    return (
        <Segment clearing>
            <Header content={'Activity Details'} sub color={'teal'}/>
            {/*<Formik validationSchema={validationSchema} enableReinitialize initialValues={activity}*/}
            {/*        onSubmit={values => handleFormSubmit(values)}>*/}
            <Formik enableReinitialize initialValues={{...activity, error: null}}
                    onSubmit={(values, {setErrors}) => handleFormSubmit(values, setErrors)}>
                {({handleSubmit, isValid, isSubmitting, dirty, errors}) => (
                    <Form className={"ui form"} onSubmit={handleSubmit} autoComplete={'off'}>
                        <MyTextInput placeholder={'title'} name={'title'}/>
                        <MyTextArea rows={3} placeholder={'Description'} name={'description'}/>
                        <MySelectInput options={categoryOptions} placeholder={'Category'} name={'category'}/>
                        <MyDateInput
                            placeholderText={'Date'}
                            name={'date'}
                            showTimeSelect
                            timeCaption={'time'}
                            dateFormat={'HH:mm dd/MM/yyyy'}
                        />
                        <Header content={'Location Details'} sub color={'teal'}/>
                        <MyTextInput placeholder={'City'} name={'city'}/>
                        <MyTextInput placeholder={'Venue'} name={'venue'}/>
                        <ErrorMessage
                            name={'error'}
                            render={() => <ValidationError errors={errors.error}/>}
                        />
                        <Button
                            disabled={isSubmitting || !isValid || !dirty}
                            loading={isSubmitting} floated={'right'} positive type={'submit'} content={'Submit'}/>
                        <Button as={Link} to={'/activities'} floated={'right'} type={'reset'} content={'Cancel'}/>
                    </Form>
                )}
            </Formik>
        </Segment>
    )
}

export default observer(ActivityForm);