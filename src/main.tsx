import * as React from "react";
import * as ReactDOM from "react-dom/client";
import loginRoutes from './authRoutes';
import mainRoutes from './mainRoutes';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';

const router = createBrowserRouter([
  ...loginRoutes(), ...mainRoutes()
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
