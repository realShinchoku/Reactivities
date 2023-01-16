import {Message} from "semantic-ui-react";

interface Props {
    errors: any;
}

export default function ValidationError({errors}: Props) {
    return (
        <Message error>
            {errors && (
                <Message.List>
                    {errors.map((error: any, index: any) => (
                        <Message.Item key={index}>{error}</Message.Item>
                    ))}
                </Message.List>
            )}
        </Message>
    )

}