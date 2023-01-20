﻿import {Photo, Profile} from "../models/profile";
import {makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";
import {store} from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loadingProfile = false;
    uploading = false;
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    get isCurrentUser() {
        if (store.userStore.user && this.profile)
            return store.userStore.user.userName == this.profile.userName;
        return false;
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
            runInAction(() => {
                if (this.profile && this.profile.photos) {
                    this.profile.photos.find(p => p.isMain)!.isMain = false;
                    this.profile.photos.find(p => p.id == photo.id)!.isMain = true;
                    this.profile.image = photo.url;
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
}