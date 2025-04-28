import { RouteObject } from "react-router-dom"
import Settings from "./user/settings";
import Notifications from './user/notifications';
import ViewUser from './user/viewUser';


export default function Routes() : RouteObject[]{
  return [
    {
        path: '/settings',
        element: <Settings></Settings>
    },
    {
      path: '/notifications',
      element: <Notifications></Notifications>
    },
    {
      path: '/user/:id',
      element: <ViewUser />
    }
  ];
}