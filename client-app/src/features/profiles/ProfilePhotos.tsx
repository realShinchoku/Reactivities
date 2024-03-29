import {observer} from "mobx-react-lite";
import {Button, Card, Grid, Header, Image, Tab} from "semantic-ui-react";
import {Photo, Profile} from "../../app/models/profile";
import {useStore} from "../../app/stores/store";
import {SyntheticEvent, useState} from "react";
import PhotoUploadWidget from "../../app/common/imageUpload/PhotoUploadWidget";

interface Props {
    profile: Profile;
}

function ProfilePhotos({profile}: Props) {
    const {profileStore: {isCurrentUser, uploadPhoto, uploading, loading, setMainPhoto, deletePhoto}} = useStore();

    const [addPhotoMode, setAddPhotoMode] = useState(false);

    const [target, setTarget] = useState('');

    async function handleSetMainPhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
        setTarget(e.currentTarget.name);
        await setMainPhoto(photo);
    }

    async function handleDeletePhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
        setTarget(e.currentTarget.name);
        await deletePhoto(photo);
    }

    function handlePhotoUpload(file: Blob) {
        uploadPhoto(file).then(() => setAddPhotoMode(false));
    }

    return (
        <Tab.Pane>
            <Grid>
                <Grid.Column width={16}>
                    <Header icon={'image'} content={'Photos'} floated={"left"}/>
                    {isCurrentUser &&
                        <Button floated={"right"} basic content={addPhotoMode ? 'Cancel' : 'Add Photo'}
                                onClick={() => setAddPhotoMode(!addPhotoMode)}/>
                    }
                </Grid.Column>
                <Grid.Column width={16}>
                    {addPhotoMode ?
                        (<PhotoUploadWidget uploadPhoto={handlePhotoUpload} loading={uploading}/>)
                        : (
                            <Card.Group itemsPerRow={5}>
                                {profile.photos?.map(photo => (
                                    <Card key={photo.id}>
                                        <Image src={photo.url}/>
                                        {isCurrentUser &&
                                            <Button.Group fluid widths={2}>
                                                <Button basic color={"green"} content={"Main"} name={'main' + photo.id}
                                                        loading={target === 'main' + photo.id && loading}
                                                        disabled={photo.isMain}
                                                        onClick={e => handleSetMainPhoto(photo, e)}/>
                                                <Button basic icon={'trash'} color={"red"} name={photo.id}
                                                        loading={target === photo.id && loading}
                                                        onClick={e => handleDeletePhoto(photo, e)}
                                                        disabled={photo.isMain}/>
                                            </Button.Group>
                                        }
                                    </Card>
                                ))}
                            </Card.Group>
                        )}
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
}

export default observer(ProfilePhotos);