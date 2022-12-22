import {ServerError} from "../models/serverError";
import {makeAutoObservable} from "mobx";

export default class CommonStore{
    error: ServerError | null = null;
    
    constructor() {
        makeAutoObservable(this)
    }
    
    setServerError(err: ServerError){
        this.error = err;
    }
    
}