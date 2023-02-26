import { App as AntdApp } from 'antd'
import { Outlet } from 'react-router-dom'
import VConsole from 'vconsole'
import './App.css'
import { useAppDispatch, useMount } from './hooks'
import { getProfileThunk } from './store/slice/user-slice'
import { IS_DEV } from './utils/constant'

export let vConsole: VConsole

const App = () => {
  const dispatch = useAppDispatch()

  useMount(() => {
    // 初始化用户信息
    void dispatch(getProfileThunk())

    // 开发环境下，配置移动端调试
    if (IS_DEV) {
      // vConsole = new VConsole()
    }
  })

  return (
    <AntdApp>
      <Outlet />
    </AntdApp>
  )
}

export default App
