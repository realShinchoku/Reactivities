import {observer} from "mobx-react-lite";
import {Image, List, Popup} from "semantic-ui-react";
import {Profile} from "../../../app/models/profile";
import {Link} from "react-router-dom";
import ProfileCard from "../../profiles/ProfileCard";

interface Props {
    id: string;
    attendees: Profile[];
}

function ActivityListItemAttendee({id, attendees}: Props) {
    return (
        <List horizontal>
            {attendees.map(attendee => (
                <Popup
                    hoverable
                    key={id + '_' + attendee.userName}
                    trigger={
                        <List.Item key={id + '_' + attendee.userName} as={Link} to={`/profiles/${attendee.userName}`}>
                            <Image size={"mini"} circular src={"/assets/user.png"}/>
                        </List.Item>
                    }
                >
                    <Popup.Content>
                        <ProfileCard profile={attendee}/>
                    </Popup.Content>
                </Popup>
            ))}
        </List>
    )
}

export default observer(ActivityListItemAttendee);