import {Message} from "semantic-ui-react";

interface  Props{
    errors: string[];
}

export default function ValidationError({errors}: Props){
    return (
        <Message error>
            {errors && (
                <Message.List>
                    {errors.map((error, index) => (
                        <Message.Item key={index}>{error}</Message.Item>
                    ))}
                </Message.List>
            )}
        </Message>
    )
    
}