import { Outlet } from 'react-router-dom'
import './App.css'
import { MeetingProvider } from './contexts/meeting-context'
import { UserProvider } from './contexts/user-context'

const App = () => {
  return (
    <UserProvider>
      <MeetingProvider>
        <Outlet />
      </MeetingProvider>
    </UserProvider>
  )
}

export default App
