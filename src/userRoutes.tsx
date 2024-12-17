import { RouteObject } from "react-router-dom"
import Settings from "./user/settings";
import Notifications from './user/notifications';


export default function Routes() : RouteObject[]{
  return [
    {
        path: '/settings',
        element: <Settings></Settings>
    },
    {
      path: '/notifications',
      element: <Notifications></Notifications>
    }
  ];
}