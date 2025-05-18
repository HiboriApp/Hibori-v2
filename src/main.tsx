import * as React from "react";
import * as ReactDOM from "react-dom/client";
import loginRoutes from './authRoutes';
import mainRoutes from './mainRoutes';
import userRoutes from './userRoutes';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import Login from "./auth/login";

const router = createBrowserRouter([
  ...loginRoutes(), ...mainRoutes(), ...userRoutes(), {path: "/login", element: <Login></Login>}
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
