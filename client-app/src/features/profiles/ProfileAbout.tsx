import {observer} from "mobx-react-lite";
import {Button, Grid, Header, Tab} from "semantic-ui-react";
import {useStore} from "../../app/stores/store";
import {useState} from "react";
import ProfileAboutForm from "./ProfileAboutForm";

function ProfileAbout() {
    const {profileStore: {profile, isCurrentUser}} = useStore();
    const [editMode, setEditMode] = useState(false);

    return (
        <Tab.Pane>
            <Grid>
                <Grid.Column width={16}>
                    <Header icon={'user'} content={'About ' + profile?.displayName} floated={"left"}/>
                    {isCurrentUser &&
                        <Button floated={"right"} basic content={editMode ? 'Cancel' : 'Edit Profile'}
                                onClick={() => setEditMode(!editMode)}/>
                    }
                </Grid.Column>
                <Grid.Column width={16}>
                    {editMode ?
                        <ProfileAboutForm profilePass={profile!} setEditMode={setEditMode}/>
                        :
                        <p style={{whiteSpace: 'pre-wrap'}}>{profile?.bio}</p>
                    }
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
}

export default observer(ProfileAbout);