/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { AntDesignOutlined, UserOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons/lib/components/Icon'
import { Avatar, Button, message, Space, Tooltip } from 'antd'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { localStream, localVideoEl } from '../../api/p2p/stream'
import { signalEmitter, signalServer } from '../../api/signal'
import { ReactComponent as HomeSvg } from '../../assets/home_fill.svg'
import { ReactComponent as SettingSvg } from '../../assets/setting-fill.svg'
import { BaseContent, BaseFooter, BaseHeader, PageContainer } from '../../components/layout'
import { Logo, StyledLink } from '../../components/lib'
import {
  LayoutContainer,
  MainContainer,
  MainContentContainer,
  RoomButton,
  RoomContainer,
  SideContainer,
} from '../../components/room'
import { StyledParagraph } from '../../components/typography'
import {
  useAppDispatch,
  useAuthenticate,
  useIsMeetingHost,
  useMeeting,
  useMount,
  useResetSignalHandlers,
  useRoomState,
  useUser,
} from '../../hooks'
import { setMeeting } from '../../store/slice/meeting-slice'
import { HOME_PATH } from '../../utils/constant'
import { createVideoElement, freeResource } from '../../utils/room'

export const Room = () => {
  useAuthenticate()

  const isMeetingHost = useIsMeetingHost()
  const user = useUser()
  const meeting = useMeeting()

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
        await signalEmitter.createRoom(roomName)
        console.log(`roomName: ${roomName}`)
      })()
    }
  })

  return (
    <PageContainer style={{ padding: 0 }}>
      <RoomContainer>
        <Main />
        <Side />
      </RoomContainer>
    </PageContainer>
  )
}

const Main = () => {
  return (
    <MainContainer direction='vertical'>
      <MainHeader />
      <MainContent />
    </MainContainer>
  )
}

const MainHeader = () => {
  const meeting = useMeeting()
  const navigate = useNavigate()

  const handleHomeClick = () => navigate(HOME_PATH)
  const handleSettingClick = () => {
    void message.info('open setting')
  }

  return (
    <BaseHeader>
      <Space className='logo-space'>
        <StyledLink to={HOME_PATH}>
          <Logo />
        </StyledLink>
        <StyledParagraph style={{ margin: '0 1.5em' }}>{meeting?.name}</StyledParagraph>
      </Space>
      <LayoutContainer>
        <RoomButton type='link' icon={<Icon component={HomeSvg} />} onClick={handleHomeClick} />
        <RoomButton type='link' icon={<Icon component={SettingSvg} />} onClick={handleSettingClick} />
      </LayoutContainer>
    </BaseHeader>
  )
}

const MainContent = () => {
  return (
    <MainContentContainer>
      <VideoContainer />
      <ControlButtonGroup />
    </MainContentContainer>
  )
}

const VideoContainer = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null)

  const resetSignalHandlers = useResetSignalHandlers()
  const isMeetingHost = useIsMeetingHost()
  const meeting = useMeeting()
  const dispatch = useAppDispatch()
  const { remoteStreams, mediaConstraints } = useRoomState()

  // 输出远端媒体流数据
  const remoteVideoEls = useMemo(() => {
    return remoteStreams.map(({ sid, remoteStream }) => createVideoElement({ srcObject: remoteStream }))
  }, [remoteStreams])

  useMount(
    /**
     * 进入会议室时，开始采集媒体数据，并建立 p2p 连接
     */
    async () => {
      /**
       * 注意：需要先采集媒体数据，然后再建立 p2p 连接，进行媒体协商
       */

      // 采集媒体数据
      await localStream.getLocalUserStream(mediaConstraints)

      // 将采集到的媒体数据输出到页面
      localStream.displayUserStream(localVideoEl)

      // 重置信令服务器的事件处理函数，以处理 p2p 连接
      void resetSignalHandlers()

      /**
       * 如果用户是加入方，则通知房间内其他用户有新用户加入房间
       * 开始建立 p2p 连接，并进行媒体协商
       */
      if (!isMeetingHost) {
        const roomName = meeting?.id as string
        const { updatedMeeting } = await signalEmitter.completeJoinRoom(roomName)
        dispatch(setMeeting(updatedMeeting))
      }
    },
    /**
     * 离开会议室时，释放所有资源
     */
    () => {
      freeResource()
    },
  )

  /**
   * 接收到远端的媒体流数据时，将其输出到页面
   */
  useEffect(() => {
    const videoContainer = videoContainerRef.current

    if (videoContainer !== null) {
      // 输出本地和远端的媒体流数据
      localStream.displayUserStream(localVideoEl)
      videoContainer.replaceChildren(localVideoEl, ...remoteVideoEls)
    }
  }, [remoteStreams])

  return <div ref={videoContainerRef} style={{ display: 'flex' }} />
}

const ControlButtonGroup = () => {
  const meeting = useMeeting()
  const navigate = useNavigate()
  const isMeetingHost = useIsMeetingHost()
  const { mediaConstraints } = useRoomState()

  const handleCameraClick = () => localStream.toggleTrack('video')
  const handleMicrophoneClick = () => localStream.toggleTrack('audio')
  const handleLeaveRoom = () => {
    const roomName = meeting?.id ?? ''

    // 通知信令服务器离开房间或关闭房间
    void (async () => {
      if (isMeetingHost) {
        await signalEmitter.closeRoom(roomName)
      } else {
        await signalEmitter.leaveRoom(roomName)
      }
    })()

    navigate(HOME_PATH)
  }
  const handleRecordClick = () => {
    // TODO 实现录制功能
    console.log('start record')
  }
  const handleShareScreen = () => {
    // 采集本地媒体流
    void localStream.getLocalScreenStream(mediaConstraints).then((screenStream) => {
      // 输出屏幕媒体流
      localStream.displayScreenStream(localVideoEl)

      // 结束屏幕共享时切换回摄像头
      screenStream?.getVideoTracks()[0].addEventListener('ended', () => {
        void localStream.getLocalUserStream(mediaConstraints).then(() => localStream.displayUserStream(localVideoEl))
      })
    })
  }

  return (
    <BaseFooter style={{ flexWrap: 'wrap' }}>
      <Button type='primary' onClick={handleCameraClick}>
        摄像头
      </Button>
      <Button type='primary' onClick={handleMicrophoneClick}>
        麦克风
      </Button>
      <Button type='primary' onClick={handleRecordClick}>
        录制
      </Button>
      <Button type='primary' onClick={handleShareScreen}>
        共享屏幕
      </Button>
      <Button type='primary' onClick={handleLeaveRoom}>
        离开房间
      </Button>
    </BaseFooter>
  )
}

const Side = () => {
  return (
    <SideContainer direction='vertical'>
      <SideHeader />
      <BaseContent>聊天记录</BaseContent>
    </SideContainer>
  )
}

const SideHeader = () => {
  return (
    <BaseHeader>
      <Avatar.Group maxCount={2} size='large' maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
        <Avatar src='https://joesch.moe/api/v1/random' />
        <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
        <Tooltip title='Ant User' placement='top'>
          <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
        </Tooltip>
        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<AntDesignOutlined />} />
      </Avatar.Group>
    </BaseHeader>
  )
}
