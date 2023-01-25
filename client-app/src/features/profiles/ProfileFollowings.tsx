import {observer} from "mobx-react-lite";
import {Card, Grid, Header, Tab} from "semantic-ui-react";
import {useStore} from "../../app/stores/store";
import ProfileCard from "./ProfileCard";

function ProfileFollowings() {
    const {profileStore: {profile, followings, loadingTab, activeTab}} = useStore();

    return (
        <Tab.Pane loading={loadingTab}>
            <Grid>
                <Grid.Column width={16}>
                    <Header floated={"left"} icon={"user"}
                            content={activeTab === 3 ? `People following ${profile?.displayName}` : `People ${profile?.displayName} is following`}/>
                </Grid.Column>
                <Grid.Column width={16}>
                    <Card.Group itemsPerRow={4}>
                        {followings.map(profile => <ProfileCard key={profile.userName} profile={profile}/>)}
                    </Card.Group>
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
}

export default observer(ProfileFollowings);