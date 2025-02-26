import { RouteObject } from "react-router-dom"
import Login from "./auth/login";
import Signup  from "./auth/signup";

export default function Routes() : RouteObject[]{
  return [
    {
      path: "/login",
      element: <Login></Login>
    },
    {
      path: '/',
      element: <Signup></Signup>
    }
  ];
}