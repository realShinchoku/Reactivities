import {Photo, Profile, ProfileFormValues, UserActivity} from "../models/profile";
import {makeAutoObservable, reaction, runInAction} from "mobx";
import agent from "../api/agent";
import {store} from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loadingProfile = false;
    uploading = false;
    loading = false;
    loadingTab = false;

    activeTab = 0;

    followings: Profile[] = [];
    userActivities: UserActivity[] = [];

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.activeTab,
            async activeTab => {
                if (activeTab === 3 || activeTab === 4) {
                    const predicate = activeTab === 3 ? 'followers' : 'following';
                    await this.loadFollowings(predicate);
                } else if (activeTab === 2) {
                    await this.loadUserActivities();
                } else {
                    this.followings = [];
                    this.userActivities = [];
                }
            }
        );
    }

    get isCurrentUser() {
        if (store.userStore.user && this.profile)
            return store.userStore.user.userName === this.profile.userName;
        return false;
    }

    setActiveTab = (activeTab: any) => {
        this.activeTab = activeTab;
    }

    loadProfile = async (username: string) => {
        this.loadingProfile = true;
        try {
            const profile = await agent.Profiles.get(username);
            runInAction(() => {
                this.profile = profile;
                this.loadingProfile = false;
            })
        } catch (e) {
            console.log(e);
        }
    }

    uploadPhoto = async (files: Blob) => {
        this.uploading = true;
        try {
            const response = await agent.Profiles.uploadPhoto(files);
            const photo = response.data;
            runInAction(() => {
                if (this.profile) {
                    this.profile.photos?.push(photo);
                    if (photo.isMain && store.userStore.user) {
                        store.userStore.setImage(photo.url);
                        this.profile.image = photo.url;

                        store.activityStore.activityRegistry.forEach(
                            activity => {
                                if (activity.hostUserName === this.profile?.userName)
                                    activity.host = this.profile;

                                activity.attendees.forEach((attendee, index, array) => {
                                    if (attendee.userName === this.profile?.userName) {
                                        array[index] = this.profile;
                                    }
                                });
                            });
                    }
                }
                this.uploading = false;
            })
        } catch (e) {
            console.log(e);
            runInAction(() => this.uploading = false);
        }
    }

    setMainPhoto = async (photo: Photo) => {
        this.loading = true;
        try {
            await agent.Profiles.setMainPhoto(photo.id);
            store.userStore.setImage(photo.url);
            await runInAction(async () => {
                if (this.profile && this.profile.photos) {
                    this.profile.photos.find(p => p.isMain)!.isMain = false;
                    this.profile.photos.find(p => p.id === photo.id)!.isMain = true;
                    this.profile.image = photo.url;

                    store.activityStore.activityRegistry.forEach(
                        activity => {
                            if (activity.hostUserName === this.profile?.userName)
                                activity.host = this.profile;

                            activity.attendees.forEach((attendee, index, array) => {
                                if (attendee.userName === this.profile?.userName) {
                                    array[index] = this.profile;
                                }
                            });
                        });
                    this.loading = false;
                }
            });
        } catch (e) {
            runInAction(() => this.loading = false);
            console.log(e);
        }
    }

    deletePhoto = async (photo: Photo) => {
        this.loading = true;
        try {
            await agent.Profiles.deletePhoto(photo.id);
            runInAction(() => {
                if (this.profile) {
                    this.profile.photos = this.profile.photos?.filter(p => p.id !== photo.id)
                }
                this.loading = false;
            });
        } catch (e) {
            runInAction(() => this.loading = false);
            console.log(e);
        }
    }

    editProfile = async (profile: ProfileFormValues) => {
        this.loading = true;
        try {
            await agent.Profiles.editProfile(profile);
            await runInAction(async () => {
                if (this.profile) {
                    let updatedProfile = {...this.profile, ...profile}
                    this.profile = updatedProfile as Profile;
                    store.userStore.setDisplayName(updatedProfile.displayName);
                    store.activityStore.activityRegistry.forEach(activity => {
                        activity.host = activity.hostUserName === updatedProfile.userName ? updatedProfile : activity.host;
                        activity.attendees.forEach((attendee, index, array) => {
                            if (attendee.userName === this.profile?.userName) {
                                array[index] = this.profile;
                            }
                        });
                    });
                }
                this.loading = false;
            })
        } catch (e) {
            console.log(e);
            runInAction(() => this.loading = false);
        }
    }

    updateFollowing = async (userName: string, following: boolean) => {
        this.loading = true;
        try {
            await agent.Profiles.updateFollowing(userName);
            store.activityStore.updateAttendeeFollowing(userName);
            runInAction(() => {
                if (this.profile && this.profile.userName !== store.userStore.user?.userName && this.profile.userName === userName) {
                    following ? this.profile.followersCount++ : this.profile.followersCount--;
                    this.profile.following = !this.profile.following;
                }
                if (this.profile && this.profile.userName === store.userStore.user?.userName) {
                    following ? this.profile.followingCount++ : this.profile.followingCount--;
                }
                this.followings.forEach(profile => {
                    if (profile.userName === userName) {
                        profile.following ? profile.followersCount-- : profile.followersCount++;
                        profile.following = !profile.following;
                    }
                });
            });
        } catch (e) {
            console.log(e);
        } finally {
            runInAction(() => this.loading = false);
        }
    }

    loadFollowings = async (predicate: string) => {
        this.loadingTab = true;
        try {
            const followings = await agent.Profiles.listFollowings(this.profile!.userName, predicate);
            runInAction(() => {
                this.followings = followings;
            });
        } catch (e) {
            console.log(e);
        } finally {
            runInAction(() => this.loadingTab = false);
        }
    }

    loadUserActivities = async (predicate?: string) => {
        this.loadingTab = true;
        try {
            const userActivities = await agent.Profiles.listActivities(this.profile!.userName, predicate!);
            runInAction(() => this.userActivities = userActivities);
        } catch (e) {
            console.log(e);
        } finally {
            runInAction(() => this.loadingTab = false);
        }
    }
}

