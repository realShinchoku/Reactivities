import {observer} from "mobx-react-lite";
import {Button, Grid, Header, Segment} from "semantic-ui-react";
import {Form, Formik} from "formik";
import MyTextInput from "../../app/common/form/MyTextInput";
import MyTextArea from "../../app/common/form/MyTextArea";
import MySelectInput from "../../app/common/form/MySelectInput";
import {categoryOptions} from "../../app/common/options/categoryOptions";
import MyDateInput from "../../app/common/form/MyDateInput";
import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useStore} from "../../app/stores/store";
import {ActivityFormValues} from "../../app/models/activity";
import * as Yup from "yup";
import {v4 as uuid} from "uuid";
import LoadingComponent from "../../app/layout/LoadingComponent";
import {Profile, ProfileFormValues} from "../../app/models/profile";

interface Props{
    profilePass: Profile;
    setEditMode: (value: boolean) => void;
}

function ProfileAboutForm({profilePass,setEditMode}: Props) {

    const {profileStore : {editProfile}} = useStore();

    const validationSchema = Yup.object({
        displayName: Yup.string().required('The Display Name is required'),
    });

    const [profile, setProfile] = useState<ProfileFormValues>(new ProfileFormValues());
    
    useEffect(() => {
        if(profilePass)
            setProfile(profilePass);
    },[profilePass,setProfile])
    
    function handleFormSubmit(profile: ProfileFormValues) {
        editProfile(profile).then(() => setEditMode(false));
    }
    
    return (
        <Grid>
            <Grid.Column width={16}>
            <Formik validationSchema={validationSchema} enableReinitialize initialValues={profile}
                    onSubmit={values => handleFormSubmit(values)}>
                {({handleSubmit, isValid, isSubmitting, dirty}) => (
                    <Form className={"ui form"} onSubmit={handleSubmit} autoComplete={'off'}>
                        <MyTextInput placeholder={'Display Name'} name={'displayName'}/>
                        <MyTextArea rows={3} placeholder={'Bio'} name={'bio'}/>
                        <Button
                            disabled={isSubmitting || !isValid || !dirty}
                            loading={isSubmitting} floated={'right'} positive type={'submit'} content={'Update profile'}/>
                    </Form>
                )}
            </Formik>
            </Grid.Column>
        </Grid>
    )
}

export default observer(ProfileAboutForm);