import {User, UserFormValues} from "../models/user";
import {makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";
import {store} from "./store";
import {router} from "../router/Routers";

export default class UserStore {
    user: User | null = null;
    fbLoading = false;
    refreshTokenTimeout: any;

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn() {
        return !!this.user;
    }

    login = async (formValues: UserFormValues) => {
        try {
            const user = await agent.Account.login(formValues);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);
            store.modalStore.closeModal();
            await router.navigate('/activities');
        } catch (err) {
            throw err;
        }
    }

    logout = async () => {
        store.commonStore.setToken(null);
        this.user = null;
        await router.navigate('/');
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);
        } catch (err) {
            console.log(err);
        }
    }

    register = async (formValues: UserFormValues) => {
        try {
            await agent.Account.register(formValues);
            store.modalStore.closeModal();
            await router.navigate(`/account/registerSuccess?email=${formValues.email}`);
        } catch (err) {
            throw err;
        }
    }

    setImage = (image: string) => {
        if (this.user)
            this.user.image = image;
    }

    setDisplayName = (displayName: string) => {
        if (this.user)
            this.user.displayName = displayName;
    }

    facebookLogin = async (accessToken: string) => {
        this.fbLoading = true;
        try {
            const user = await agent.Account.fbLogin(accessToken);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);
            router.navigate('/activities')
        } catch (e) {
            console.log(e);
        } finally {
            runInAction(() => this.fbLoading = false);
        }
    }

    refreshToken = async () => {
        this.stopRefreshTokenTimer();
        try {
            const user = await agent.Account.refreshToken();
            runInAction(() => this.user = user);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
        } catch (e) {
            console.log(e);
        }
    }

    private startRefreshTokenTimer(user: User) {
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (120 * 1000);
        this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}