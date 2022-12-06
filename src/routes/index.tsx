import { createBrowserRouter } from 'react-router-dom'
import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { AudioRoom } from '../pages/Room/audio-room'
import { TextRoom } from '../pages/Room/text-room'
import { VideoRoom } from '../pages/Room/video-room'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    index: true,
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'register',
    element: <Register />,
  },
  {
    path: 'video-room',
    element: <VideoRoom />,
  },
  {
    path: 'audio-room',
    element: <AudioRoom />,
  },
  {
    path: 'text-room',
    element: <TextRoom />,
  },
])
