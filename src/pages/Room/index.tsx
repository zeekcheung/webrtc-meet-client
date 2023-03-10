/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { signalEmitter, signalServer } from '../../api/signal'
import { PageContainer } from '../../components/layout'
import { RoomContainer } from '../../components/room'
import { useAppDispatch, useAuthenticate, useIsMeetingHost, useMeeting, useMount, useUser } from '../../hooks'
import { setRoomState } from '../../store/slice/room-slice'
import { RoomMain } from './main'
import { RoomSide } from './side'

export const Room = () => {
  useAuthenticate()

  const isMeetingHost = useIsMeetingHost()
  const user = useUser()
  const meeting = useMeeting()
  const dispatch = useAppDispatch()

  /**
   * 如果用户是会议主持人的话，在 meeting 创建成功之后，通知信令服务器创建一个新的房间
   */
  useMount(() => {
    if (isMeetingHost) {
      void (async () => {
        const username = user?.username as string
        const roomName = meeting?.id as string

        // 初始化信令服务器
        await signalServer.init(username)

        // 使用 meeting.id 作为房间号，创建一个新的房间
        const userList = await signalEmitter.createRoom(roomName)
        // console.log(`roomName: ${roomName}`)

        // 更新 RoomState 状态
        dispatch(setRoomState({ roomName, userList }))
      })()
    }
  })

  return (
    <PageContainer style={{ padding: 0 }}>
      <RoomContainer>
        <RoomMain />
        <RoomSide />
      </RoomContainer>
    </PageContainer>
  )
}
