import {User} from "./user";

export interface Profile {
    userName: string;
    displayName: string;
    image?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    following: boolean;
    photos?: Photo[];
}

export class Profile implements Profile {
    constructor(user: User) {
        this.userName = user.userName;
        this.displayName = user.displayName;
        this.image = user.image;
    }
}

export interface Photo {
    id: string;
    url: string;
    isMain: boolean;
}

export class ProfileFormValues {
    bio?: string = undefined;
    displayName: string = '';

    constructor(profile?: ProfileFormValues) {
        if (profile) {
            this.bio = profile.bio;
            this.displayName = profile.displayName;
        }
    }
}


export interface UserActivity {
    id: string;
    title: string;
    category: string;
    date: Date;
}