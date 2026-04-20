import { lazy, Suspense } from "react"
import { Navigate, RouteObject } from "react-router-dom"
import Loading from "./components/Loading"

const Signup = lazy(() => import("./auth/signup"))
const Login = lazy(() => import("./auth/login"))

function withLoader(element: React.ReactNode) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>
}

export default function Routes() : RouteObject[]{
  return [
    {
      path: '/',
      children: [
        {
          index: true,
          element: <Navigate to="/signup/credentials" replace />,
        },
        {
          path: 'signup/credentials',
          element: withLoader(<Signup />)
        },
        {
          path: 'signup/classroom',
          element: withLoader(<Signup />)
        },
        {
          path: 'signup/profile-theme',
          element: withLoader(<Signup />)
        },
        {
          path: 'loginnew',
          element: withLoader(<Login />)
        }
      ]
    }
  ];
}