import { RouteObject } from "react-router-dom"
import Login from "./auth/login";

export default function Routes() : RouteObject[]{
  return [
    {
      path: "/",
      element: <Login></Login>
    }
  ];
}