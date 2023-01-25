import {observer} from "mobx-react-lite";
import {Card, Grid, Header, Image, Tab, TabProps} from "semantic-ui-react";
import {useStore} from "../../app/stores/store";
import {Link} from "react-router-dom";
import {UserActivity} from "../../app/models/profile";
import {format} from "date-fns";
import {SyntheticEvent, useEffect} from "react";

const panes = [
    {menuItem: 'Future Events', pane: {key: 'future'}},
    {menuItem: 'Past Events', pane: {key: 'past'}},
    {menuItem: 'Hosting', pane: {key: 'hosting'}}
];

function ProfileActivities() {
    const {profileStore: {loadingTab, loadUserActivities, userActivities}} = useStore();

    useEffect(() => {
        loadUserActivities();
    }, [loadUserActivities])

    async function handleTabChange(e: SyntheticEvent, data: TabProps) {
        await loadUserActivities(panes[data.activeIndex as number].pane.key);
    }

    return (
        <Tab.Pane loading={loadingTab}>
            <Grid>
                <Grid.Column width={16}>
                    <Header icon={'calendar'} content={'Activities'} floated={"left"}/>
                </Grid.Column>
                <Grid.Column width={16}>
                    <Tab
                        panes={panes}
                        menu={{secondary: true, pointing: true}}
                        onTabChange={(e, data) => handleTabChange(e, data)}
                    />
                    <br/>
                    <Card.Group itemsPerRow={4}>
                        {userActivities.map((activity: UserActivity) => (
                            <Card
                                as={Link}
                                to={`/activities/${activity.id}`}
                                key={activity.id}
                            >
                                <Image src={`/assets/categoryImages/${activity.category}.jpg`}
                                       style={{minHeight: 100, objectFit: 'cover'}}/>
                                <Card.Content>
                                    <Card.Header
                                        textAlign='center'>{activity.title}</Card.Header>
                                    <Card.Meta textAlign='center'>
                                        <div>{format(new Date(activity.date), 'do LLL')}</div>
                                        <div>{format(new Date(activity.date), 'h:mm a')}</div>
                                    </Card.Meta>
                                </Card.Content>
                            </Card>
                        ))}
                    </Card.Group>
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
}

export default observer(ProfileActivities);