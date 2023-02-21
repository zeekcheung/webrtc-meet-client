import { App as AntdApp } from 'antd'
import { MessageInstance } from 'antd/es/message/interface'
import { ModalStaticFunctions } from 'antd/es/modal/confirm'
import { NotificationInstance } from 'antd/es/notification/interface'
import { Outlet } from 'react-router-dom'
import './App.css'
import { useAppDispatch, useMount } from './hooks'
import { getProfileThunk } from './store/slice/user-slice'

let message: MessageInstance
let notification: NotificationInstance
let modal: Omit<ModalStaticFunctions, 'warn'>

const App = () => {
  const dispatch = useAppDispatch()
  // 初始化用户信息
  useMount(() => {
    void dispatch(getProfileThunk())
  })

  return (
    <AntdApp>
      <Outlet />
    </AntdApp>
  )
}

export default App

export { message, notification, modal }
