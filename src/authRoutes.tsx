import { RouteObject } from "react-router-dom"
import Login from "./auth/login";
import { Signup } from "./auth/signup";

export default function Routes() : RouteObject[]{
  return [
    {
      path: "/",
      element: <Login></Login>
    },
    {
      path: '/signup',
      element: <Signup></Signup>
    }
  ];
}