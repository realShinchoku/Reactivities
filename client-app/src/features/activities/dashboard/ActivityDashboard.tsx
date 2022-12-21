import React from "react";
import {Grid} from "semantic-ui-react";
import ActivityList from "./ActivityList";
import ActivityDetails from "../details/ActivityDetails";
import ActivityFrom from "../from/ActivityFrom";
import {useStore} from "../../../app/stores/store";
import {observer} from "mobx-react-lite";

function ActivityDashboard() {
    const {activityStore} = useStore();
    const {selectedActivity, editMode} = activityStore;
    return (
        <Grid>
            <Grid.Column width={'10'}>
                <ActivityList/>
            </Grid.Column>
            <Grid.Column width={'6'}>
                {selectedActivity && !editMode &&
                    <ActivityDetails/>}
                {editMode &&
                    <ActivityFrom/>
                }
            </Grid.Column>
        </Grid>
    )
}

export default observer(ActivityDashboard);