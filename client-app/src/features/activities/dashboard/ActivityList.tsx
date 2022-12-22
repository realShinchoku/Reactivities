import {Header} from "semantic-ui-react";
import {useStore} from "../../../app/stores/store";
import {observer} from "mobx-react-lite";
import ActivityListItem from "./ActivityListItem";
import {Fragment} from "react";

function ActivityList() {

    const {activityStore} = useStore();
    const {groupedActivities} = activityStore;

    return (
        <>
            {groupedActivities.map(([group, activities]) => (
                <Fragment key={group}>
                    <Header sub color={'teal'}>
                        {group}
                    </Header>

                    {activities.map(
                        (activity) => <ActivityListItem activity={activity}/>
                    )}
                </Fragment>
            ))}
        </>
    );
}

export default observer(ActivityList);