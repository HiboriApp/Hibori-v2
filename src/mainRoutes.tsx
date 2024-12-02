import { RouteObject } from "react-router-dom"
import Home from "./main/home";

export default function Routes() : RouteObject[]{
  return [
    {
      path: "/home",
      element: <Home></Home>
    }
  ];
}