/* eslint-disable @typescript-eslint/promise-function-async */
import { lazy } from 'react'
import { createBrowserRouter, RouteObject } from 'react-router-dom'
import App from '../App'
import { PROFILE_PATH, ROOM_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../utils/constant'

const ErrorPage = lazy(() => import('../pages/Error'))
const Home = lazy(() => import('../pages/Home'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Profile = lazy(() => import('../pages/Profile'))
const Room = lazy(() => import('../pages/Room'))
const SignIn = lazy(() => import('../pages/SignIn'))
const SignUp = lazy(() => import('../pages/SignUp'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    // error
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: SIGN_UP_PATH,
        element: <SignUp />,
      },
      {
        path: SIGN_IN_PATH,
        element: <SignIn />,
      },
      {
        path: PROFILE_PATH,
        element: <Profile />,
      },
      {
        path: ROOM_PATH,
        element: <Room />,
      },
    ],
  },
  // 404
  {
    path: '*',
    element: <NotFound />,
  },
]

export const router = createBrowserRouter(routes)
