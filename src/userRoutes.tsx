import { lazy, Suspense } from "react"
import { RouteObject } from "react-router-dom"
import Loading from "./components/Loading"

const Settings = lazy(() => import("./user/settings"))
const Notifications = lazy(() => import("./user/notifications"))
const ViewUser = lazy(() => import("./user/viewUser"))

function withLoader(element: React.ReactNode) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>
}


export default function Routes() : RouteObject[]{
  return [
    {
        path: '/settings',
        element: withLoader(<Settings />)
    },
    {
      path: '/notifications',
      element: withLoader(<Notifications />)
    },
    {
      path: '/user/:id',
      element: withLoader(<ViewUser />)
    }
  ];
}