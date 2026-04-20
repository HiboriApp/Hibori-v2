import { lazy, Suspense } from "react"
import { RouteObject } from "react-router-dom"
import Loading from "./components/Loading"

const Home = lazy(() => import("./main/home"))
const Connections = lazy(() => import("./main/connections"))
const Messages = lazy(() => import("./main/messages"))
const AddFriendsPage = lazy(() => import("./main/add-connections"))
const AiFriends = lazy(() => import("./main/ai"))

function withLoader(element: React.ReactNode) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>
}

export default function Routes() : RouteObject[]{
  return [
    {
      path: "/home",
      element: withLoader(<Home />)
    },
    {
      path: '/connections',
      element: withLoader(<Connections />)
    },
    {
      path: '/messages',
      element: withLoader(<Messages />)
    },
    {
      path: '/addfriends',
      element: withLoader(<AddFriendsPage />)
    },
    {
      path: '/messages/:id',
      element: withLoader(<Messages />)
    },
    {
      path: '/ai',
      element: withLoader(<AiFriends />)
    }

  ];
}