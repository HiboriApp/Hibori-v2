import { RouteObject } from "react-router-dom"
import Settings from "./user/settings";
import Notifications from './user/notifications';
import Qna from "./user/qna";


export default function Routes() : RouteObject[]{
  return [
    {
        path: '/settings',
        element: <Settings></Settings>
    },
    {
        path: '/qna',
        element: <Qna></Qna>
    },
    {
      path: '/notifications',
      element: <Notifications></Notifications>
    }
  ];
}