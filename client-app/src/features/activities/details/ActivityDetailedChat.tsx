import {observer} from 'mobx-react-lite'
import React, {useEffect} from 'react'
import {Comment, Header, Loader, Segment} from 'semantic-ui-react'
import {useStore} from "../../../app/stores/store";
import {Link} from "react-router-dom";
import {Field, FieldProps, Form, Formik} from "formik";
import * as Yup from 'yup';
import {formatDistanceToNow} from "date-fns";

interface Props {
    activityId: string;
}

function ActivityDetailedChat({activityId}: Props) {
    const {commentStore} = useStore();

    useEffect(() => {
        if (activityId)
            commentStore.createHubConnection(activityId);
        return () => {
            commentStore.clearComments();
        }
    }, [commentStore, activityId]);

    return (
        <>
            <Segment
                textAlign='center'
                attached='top'
                inverted
                color='teal'
                style={{border: 'none'}}
            >
                <Header>Chat about this event</Header>
            </Segment>

            <Formik initialValues={{body: ''}}
                    validationSchema={Yup.object({
                        body: Yup.string().required()
                    })}
                    onSubmit={(values, {resetForm}) => {
                        commentStore.addComment(values).then(() => resetForm())
                    }}
            >
                {({isSubmitting, isValid, handleSubmit}) =>
                    <Form className={'ui form'}>
                        <Field name={'body'}>
                            {(props: FieldProps) =>
                                <div style={{position: "relative"}}>
                                    <Loader active={isSubmitting}/>
                                    <textarea
                                        placeholder={'Enter your comment (Enter to submit, Shift + Enter for new line)'}
                                        rows={2}
                                        {...props.field}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && e.shiftKey)
                                                return;

                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                isValid && handleSubmit();
                                            }
                                        }}
                                    />
                                </div>
                            }
                        </Field>
                    </Form>}
            </Formik>

            <Segment attached clearing>
                <Comment.Group>
                    {commentStore.comments.map(comment =>
                        <Comment key={comment.id}>
                            <Comment.Avatar src={comment.image || '/assets/user.png'}/>
                            <Comment.Content>
                                <Comment.Author as={Link}
                                                to={`/profiles/${comment.userName}`}>{comment.displayName}</Comment.Author>
                                <Comment.Metadata>
                                    <div>{formatDistanceToNow(comment.createdAt)}</div>
                                </Comment.Metadata>
                                <Comment.Text style={{whiteSpace: 'pre-wrap'}}>{comment.body}</Comment.Text>
                            </Comment.Content>
                        </Comment>
                    )}
                </Comment.Group>
            </Segment>
        </>
    )
}

export default observer(ActivityDetailedChat);