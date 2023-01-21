import {Profile} from "../../app/models/profile";
import {Card, Icon, Image} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {observer} from "mobx-react-lite";

interface Props {
    profile: Profile;
}

function ProfileCard({profile}: Props) {
    return (
        <Card as={Link} to={`/profiles/${profile.userName}`}>
            <Image src={profile.image || '/assets/user.png'}/>
            <Card.Content>
                <Card.Header>{profile.displayName}</Card.Header>
                <Card.Description style={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }}>{profile.bio}</Card.Description>
            </Card.Content>
            <Card.Content extra>
                <Icon name={'user'}/>
                20 followers
            </Card.Content>
        </Card>
    )
}

export default observer(ProfileCard);