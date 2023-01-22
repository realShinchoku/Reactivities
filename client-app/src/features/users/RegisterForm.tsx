import {ErrorMessage, Form, Formik} from "formik";
import MyTextInput from "../../app/common/form/MyTextInput";
import {Button, Header} from "semantic-ui-react";
import {observer} from "mobx-react-lite";
import {useStore} from "../../app/stores/store";
import * as Yup from "yup";
import ValidationError from "../Error/ValidationError";

function RegisterForm() {
    const {userStore} = useStore();

    return (
        <Formik
            initialValues={{displayName: '', userName: '', email: '', password: '', error: null}}
            onSubmit={(values, {setErrors}) => userStore.login(values).catch(error => setErrors({error}))}
            validationSchema={Yup.object({
                displayName: Yup.string().required(),
                userName: Yup.string().required(),
                email: Yup.string().required(),
                password: Yup.string().required(),
            })}
        >
            {({handleSubmit, isSubmitting, errors, isValid, dirty}) => (
                <Form className="ui form" onSubmit={handleSubmit} autoComplete={'off'}>
                    <Header as={'h2'} content={"Sign up Reactivities"} color={'teal'} textAlign={"center"}/>
                    <MyTextInput placeholder={'Display Name'} name={'displayName'}/>
                    <MyTextInput placeholder={'User Name'} name={'userName'}/>
                    <MyTextInput placeholder={'Email'} name={'email'}/>
                    <MyTextInput placeholder={'Password'} name={'password'} type={'password'}/>
                    <ErrorMessage
                        name={'error'}
                        render={() => <ValidationError errors={errors.error}/>}
                    />
                    <Button
                        disabled={!isValid || !dirty || isSubmitting}
                        loading={isSubmitting}
                        type={'submit'} positive fluid
                        content={'Register'}/>
                </Form>
            )}
        </Formik>
    )
}

export default observer(RegisterForm);