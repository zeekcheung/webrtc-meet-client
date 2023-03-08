/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { PlusSquareOutlined, UploadOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons/lib/components/Icon'
import { Avatar, Button, message, Space, Tooltip, Upload, UploadFile, UploadProps } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pcMaps } from '../../api/p2p'
import { localStream, localVideoEl } from '../../api/p2p/stream'
import { signalEmitter, signalServer } from '../../api/signal'
import { ReactComponent as HomeSvg } from '../../assets/home_fill.svg'
import { ReactComponent as SendSvg } from '../../assets/send.svg'
import { ReactComponent as SettingSvg } from '../../assets/setting-fill.svg'
import { BaseFooter, BaseHeader, PageContainer } from '../../components/layout'
import { Logo, StyledAvatar, StyledLink } from '../../components/lib'
import {
  ChatListContainer,
  LayoutContainer,
  MainContainer,
  MainContentContainer,
  RoomButton,
  RoomContainer,
  SideContainer,
  SideContentContainer,
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
import { roomInitialState, setRoomState } from '../../store/slice/room-slice'
import { HOME_PATH } from '../../utils/constant'
import { copyContent, createVideoElement, freeAllResource } from '../../utils/room'

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
        console.log(`roomName: ${roomName}`)

        // 更新 RoomState 状态
        dispatch(setRoomState({ roomName, userList }))
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
    () => {
      freeAllResource()
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
  const dispatch = useAppDispatch()

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

    // 重置 store 状态
    dispatch(setRoomState(roomInitialState))
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
      <SideContent />
    </SideContainer>
  )
}

const SideHeader = () => {
  const { userList, roomName } = useRoomState()
  const handleShareRoom = () => {
    void copyContent(roomName)
    void message.success('The link of the meeting has been copied successfully! Share it to others!')
  }

  return (
    <BaseHeader style={{ alignItems: 'center' }}>
      <Avatar.Group maxCount={3} size='default' maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
        {userList.map(({ sid, username }) => {
          return (
            <Tooltip title={username} placement='top' key={sid}>
              <StyledAvatar username={username} />
            </Tooltip>
          )
        })}
      </Avatar.Group>

      <RoomButton type='link' icon={<PlusSquareOutlined />} onClick={handleShareRoom}>
        Add User
      </RoomButton>
    </BaseHeader>
  )
}

const SideContent = () => {
  const [message, setMessage] = useState('')

  const dispatch = useAppDispatch()
  const roomState = useRoomState()
  const user = useUser()

  const sendMessage = () => {
    if (message.length === 0) {
      return
    }

    // 发送消息
    const username = user?.username as string

    dispatch(
      setRoomState({
        messageList: [...roomState.messageList, { username, message, date: new Date().toUTCString() }],
      }),
    )

    pcMaps.forEach((pc) => pc.sendTextMessage(message))
    setMessage('')
  }

  return (
    <SideContentContainer>
      <ChatHistory />
      <Space className='room-side-footer'>
        <InputArea message={message} setMessage={setMessage} sendMessage={sendMessage} />
        <Space direction='vertical'>
          <RoomButton type='link' icon={<Icon component={SendSvg} />} onClick={sendMessage}></RoomButton>
          <SendFileButton />
        </Space>
      </Space>
    </SideContentContainer>
  )
}

const ChatHistory = () => {
  const { messageList } = useRoomState()
  const user = useUser()
  const username = user?.username

  return (
    <ChatListContainer direction='vertical'>
      {messageList.map(({ username: _username, message, date }, index) => {
        return (
          <div key={index}>
            {_username === username ? (
              <>
                <div style={{ float: 'right' }}>
                  <span style={{ backgroundColor: '#51B56D', marginRight: '2em' }}>{message}</span>
                  <StyledAvatar username={username} />
                </div>
              </>
            ) : (
              <>
                <StyledAvatar username={_username} />
                <span style={{ backgroundColor: '#252C34', marginRight: '2em' }}>{message}</span>
              </>
            )}
          </div>
        )
      })}
      <div style={{ display: 'none' }}></div>
    </ChatListContainer>
  )
}

const InputArea = ({
  message,
  sendMessage,
  setMessage,
}: {
  message: string
  sendMessage: () => void
  setMessage: React.Dispatch<React.SetStateAction<string>>
}) => {
  const handleMessageChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setMessage(e.target.value)
  }

  return (
    <TextArea
      rows={2}
      value={message}
      onPressEnter={sendMessage}
      onChange={handleMessageChange}
      style={{ backgroundColor: 'inherit', color: 'white' }}
    />
  )
}

const SendFileButton = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  // const [uploading, setUploading] = useState(false)

  // const handleUpload = () => {
  //   const formData = new FormData()
  //   fileList.forEach((file) => {
  //     formData.append('files[]', file as RcFile)
  //   })
  //   setUploading(true)
  //   // You can use any AJAX library you like
  //   fetch('https://www.mocky.io/v2/5cc8019d300000980a055e76', {
  //     method: 'POST',
  //     body: formData,
  //   })
  //     .then(async (res) => await res.json())
  //     .then(() => {
  //       setFileList([])
  //       void message.success('upload successfully.')
  //     })
  //     .catch(() => {
  //       void message.error('upload failed.')
  //     })
  //     .finally(() => {
  //       setUploading(false)
  //     })
  // }

  const handleRemove: UploadProps['onRemove'] = (file) => {
    const index = fileList.indexOf(file)
    const newFileList = fileList.slice()
    newFileList.splice(index, 1)
    setFileList(newFileList)
  }
  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    setFileList([...fileList, file])

    return false
  }

  return (
    <>
      <Upload fileList={fileList} onRemove={handleRemove} beforeUpload={handleBeforeUpload} showUploadList={false}>
        <RoomButton type='link' icon={<UploadOutlined />}></RoomButton>
      </Upload>
    </>
  )
}
