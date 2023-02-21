import { useEffect } from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { signalServer } from '../api/signal'
import { meetingSelector, setMeeting } from '../store/slice/meeting-slice'
import { userSelector } from '../store/slice/user-slice'
import { AppDispatch, RootState } from '../types/store'
import { HOME_PATH, RoutePath } from '../utils/constant'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useMount = (callback: () => any) => {
  useEffect(() => {
    callback()
  }, [])
}

/**
 * 从 `store` 中读取根状态
 * @returns 根状态
 */
export const useRootState = () => {
  return useAppSelector((state) => state)
}

/**
 * 从 `store` 中读取 `user` 状态
 * @returns `rootState.user.value`
 */
export const useUser = () => {
  return useAppSelector(userSelector)
}

/**
 * 从 `store` 中读取 `meeting` 状态
 *  * @returns `rootState.meeting.value`
 */
export const useMeeting = () => {
  return useAppSelector(meetingSelector)
}

/**
 * 验证用户是否已经登录，如果未登录，则执行 `callback` 回调函数，并重定向至 `redirect` 路由
 * @param callback 用户未登录时执行的回调函数
 * @param redirect 用户未登录时重定向的路由
 */
export const useAuthenticate = (callback?: () => void, redirect: RoutePath = HOME_PATH) => {
  const user = useUser()
  const navigate = useNavigate()

  useMount(() => {
    if (user === null) {
      callback?.()
      navigate(redirect)
    }
  })
}

/**
 * 判断用户是否是会议的主持人
 * @returns 用户是否是会议的主持人
 */
export const useIsMeetingHost = () => {
  const user = useUser()
  const meeting = useMeeting()

  return user?.username === meeting?.host?.username
}

export const useInitSignalServer = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const intiSignalServer = async (username: string) => {
    return await signalServer.init(username, {
      handleOtherJoinCallback: ({ username, updatedMeeting, room }) => {
        // 有其他用户加入房间时，更新 store 中的 meeting
        dispatch(setMeeting(updatedMeeting))
        console.log(`${username} join room.`)
        console.log(room)
      },
      handleOtherLeaveCallback: ({ username, room }) => {
        console.log(`${username} leave room.`)
        console.log(room)
      },
      handleRoomClosedCallback: (meeting) => {
        console.log(`The meeting has ended.`)
        console.log(meeting)
        // 回到主页
        navigate(HOME_PATH)
      },
      handleReceiveMessageCallback: ({ username, message }) => {
        console.log(`receive message from : ${username}`)
        console.log(message)
      },
    })
  }

  return intiSignalServer
}
