import {Button, Header, Icon, Segment} from "semantic-ui-react";
import {Link} from "react-router-dom";

export default function NotFound() {
    return (
        <Segment placeholder>
            <Header icon>
                <Icon name={"search"}/>
                Oops - can't find what you're looking for!
            </Header>
            <Segment.Inline>
                <Button as={Link} to={'/activities'}>
                    Return to Activities Page
                </Button>
            </Segment.Inline>
        </Segment>
    );
}