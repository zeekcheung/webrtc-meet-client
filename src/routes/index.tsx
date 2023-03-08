import { createBrowserRouter, RouteObject } from 'react-router-dom'
import App from '../App'
import { ErrorPage } from '../pages/Error'
import { Home } from '../pages/Home'
import { NotFound } from '../pages/NotFound'
import { Room } from '../pages/Room'
import { SignIn } from '../pages/SignIn'
import { Profile } from '../pages/SignIn/Profile'
import { SignUp } from '../pages/SignUp'
import { PROFILE_PATH, ROOM_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../utils/constant'

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
