import { useEffect } from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { pcMaps, PeerConnection } from '../api/p2p'
import { signalListener } from '../api/signal'
import store from '../store'
import { meetingSelector, setMeeting } from '../store/slice/meeting-slice'
import { roomInitialState, roomSelector, setRoomState } from '../store/slice/room-slice'
import { userSelector } from '../store/slice/user-slice'
import { HandleRemoteChannel, HandleRemoteStream } from '../types/p2p'
import { ResetSignalHandlersProps } from '../types/signal'
import { AppDispatch, RootState } from '../types/store'
import { HOME_PATH, RoutePath } from '../utils/constant'
import { freeAllResource, freeResourceWith } from '../utils/room'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useMount = (onMount: () => any, onUnmount?: () => void) => {
  useEffect(() => {
    onMount()
    return onUnmount
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
 * 从 `store` 中读取 `room` 状态
 *  * @returns `rootState.room`
 */
export const useRoomState = () => {
  return useAppSelector(roomSelector)
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

/**
 * 加入房间后，重置信令服务器的事件处理函数
 * @returns 重置信令服务器事件处理函数的函数
 */
export const useResetSignalHandlers = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  /**
   * 加入房间后，重置信令服务器的事件处理函数，以处理 p2p 连接
   * @param peerConnectionConfig 与对端的 p2p 连接的配置
   * @param offerSdpOptions 发送给对端的 OfferSdp 的配置
   * @returns
   */
  const resetSignalHandlers = async ({ peerConnectionConfig, offerSdpOptions }: ResetSignalHandlersProps = {}) => {
    /**
     * 处理对端的媒体流数据
     */
    const handleRemoteStream: HandleRemoteStream = ({ sid, remoteStream }) => {
      /**
       * 除了通过 useSelector Hooks 获取 store 中的状态之外
       * 还能通过 store.getState Api 获取状态
       */
      const roomState = store.getState().room
      const remoteStreams = [...roomState.remoteStreams, { sid, remoteStream }]
      dispatch(setRoomState({ remoteStreams }))
    }

    /**
     * 处理对端的文本数据
     */
    const handleRemoteText: HandleRemoteChannel['handleRemoteText'] = ({ username, message }) => {
      console.log(`get text message from ${username}: ${message}`)

      const roomState = store.getState().room
      const messageList = [...roomState.messageList, { username, message, date: new Date().toUTCString() }]

      dispatch(setRoomState({ messageList }))
    }

    /**
     * 处理对端的文件数据
     */
    const handleRemoteFile: HandleRemoteChannel['handleRemoteFile'] = ({ username, file }) => {
      console.log(`get file message from ${username}: `, file)
    }

    return signalListener.registerAllHandlers({
      /**
       * 处理其他用户加入房间
       */
      handleOtherJoinCallback: ({ username, updatedMeeting, userList }) => {
        const sid = userList.find((user) => user.username === username)?.sid
        console.log(`${username}:${sid} join room.`)
        console.log(userList)
        // 更新 store 中的 meeting
        dispatch(setMeeting(updatedMeeting))
        // 更新 store 中的 userList
        dispatch(setRoomState({ userList }))
        // 建立一个新的 p2p 连接，与该用户所在的对端对应
        if (sid === undefined) {
          throw new Error(`${username}'s sid is undefined.`)
        }
        const pc = new PeerConnection({
          username,
          sid,
          connectionConfig: peerConnectionConfig,
          handleRemoteStream,
          handleRemoteText,
          handleRemoteFile,
        })
        pcMaps.set(username, pc)
        // 与对端进行媒体协商
        void pc.startNegotiate(offerSdpOptions)
      },
      /**
       * 处理接收到对端的媒体协商数据
       */
      handleReceiveMessageCallback: async ({ username, message, sid }) => {
        // console.log(`receive message from: ${username}`)
        // console.log(message)

        let pc = pcMaps.get(username)

        /**
         * 如果没找到对端的 p2p 连接，说明本机是加入方
         * 在接收到媒体协商数据时，创建对应的 p2p 连接
         */
        if (pc === undefined) {
          pc = new PeerConnection({
            username,
            sid,
            connectionConfig: peerConnectionConfig,
            handleRemoteStream,
            handleRemoteFile,
            handleRemoteText,
          })
          pcMaps.set(username, pc)
        }

        // 媒体协商
        void pc.handleNegotiateMessage(message)
      },
      handleOtherLeaveCallback: ({ username, userList }) => {
        console.log(`${username} leave room.`)
        console.log(userList)
        freeResourceWith(username)
        // 更新 store 中的 userList
        dispatch(setRoomState({ userList }))
      },
      handleRoomClosedCallback: (meeting) => {
        console.log(`The meeting has ended.`)
        console.log(meeting)
        // 重置 store 中的状态
        dispatch(setMeeting(null))
        dispatch(setRoomState(roomInitialState))
        // 释放资源
        freeAllResource()
        // 回到主页
        navigate(HOME_PATH)
      },
    })
  }

  return resetSignalHandlers
}
