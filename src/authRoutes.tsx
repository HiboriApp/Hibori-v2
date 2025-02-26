import { RouteObject } from "react-router-dom"
import Signup  from "./auth/signup";

export default function Routes() : RouteObject[]{
  return [
    {
      path: '/',
      element: <Signup></Signup>
    }
  ];
}