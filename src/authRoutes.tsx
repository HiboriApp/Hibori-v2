import { RouteObject } from "react-router-dom"
import Signup  from "./auth/signup";
import Login from "./auth/login";

export default function Routes() : RouteObject[]{
  return [
    {
      path: '/',
      children: [
        { 
          index: true,
          element: <Signup />
        },
        {
          path: 'loginnew',
          element: <Login />
        }
      ]
    }
  ];
}