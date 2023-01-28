import {createBrowserRouter, Navigate, RouteObject} from "react-router-dom";
import App from "../layout/App";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import ActivityForm from "../../features/activities/form/ActivityForm";
import TestErrors from "../../features/Error/TestError";
import NotFound from "../../features/Error/NotFound";
import ServerError from "../../features/Error/ServerError";
import LoginForm from "../../features/users/LoginForm";
import ProfilePage from "../../features/profiles/ProfilePage";
import RequireAuth from "./RequireAuth";

export const route = {};

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App/>,
        children: [
            {element: <RequireAuth/>, children:[
                    {path: 'activities', element: <ActivityDashboard/>},
                    {path: 'activities/:id', element: <ActivityDetails/>},
                    {path: 'createActivity', element: <ActivityForm key={'create'}/>},
                    {path: 'manage/:id', element: <ActivityForm key={'manage'}/>},
                    {path: 'profiles/:username', element: <ProfilePage/>},
                ]},
            {path: 'login', element: <LoginForm/>},
            {path: 'errors', element: <TestErrors/>},
            {path: 'not-found', element: <NotFound/>},
            {path: 'server-error', element: <ServerError/>},
            {path: '*', element: <Navigate replace to={'/not-found'}/>},
        ],
    }
]
export const router = createBrowserRouter(routes);