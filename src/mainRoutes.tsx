import { RouteObject } from "react-router-dom"
import Home from "./main/home";
import Connections from "./main/connections";
import Messages from "./main/messages";
import AddFriendsPage from "./main/add-connections";
import AiFriends from './main/ai';

export default function Routes() : RouteObject[]{
  return [
    {
      path: "/home",
      element: <Home></Home>
    },
    {
      path: '/connections',
      element: <Connections></Connections>
    },
    {
      path: '/messages',
      element: <Messages></Messages>
    },
    {
      path: '/addfriends',
      element: <AddFriendsPage></AddFriendsPage>
    },
    {
      path: '/messages/:id',
      element: <Messages></Messages>
    },
    {
      path: '/ai',
      element: <AiFriends></AiFriends>
    }

  ];
}