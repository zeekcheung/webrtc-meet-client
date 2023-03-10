import Icon, { AudioFilled, CameraFilled, RobotFilled, StepBackwardFilled, VideoCameraFilled } from '@ant-design/icons'
import { Checkbox, Col, message, Popconfirm, Row, Space } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MediaStreamRecorder } from '../../api/p2p/record'
import { localStream, localVideoEl } from '../../api/p2p/stream'
import { signalEmitter } from '../../api/signal'
import { ReactComponent as HomeSvg } from '../../assets/home_fill.svg'
import { ReactComponent as SettingSvg } from '../../assets/setting-fill.svg'
import { BaseFooter, BaseHeader } from '../../components/layout'
import { Logo, StyledLink } from '../../components/lib'
import { ControlButton, LayoutContainer, MainContainer, MainContentContainer, RoomButton } from '../../components/room'
import { StyledParagraph } from '../../components/typography'
import {
  useAppDispatch,
  useIsMeetingHost,
  useMeeting,
  useMount,
  useResetSignalHandlers,
  useRoomState,
  useUser,
} from '../../hooks'
import { setMeeting } from '../../store/slice/meeting-slice'
import { roomInitialState, setRoomState } from '../../store/slice/room-slice'
import { RecordCheckboxProps, RecorderMap } from '../../types/room'
import { HOME_PATH } from '../../utils/constant'
import { createVideoElement, freeAllResource } from '../../utils/room'

export const RoomMain = () => {
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
    return remoteStreams.map(({ sid, stream: remoteStream }) => createVideoElement({ srcObject: remoteStream }))
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

  const [cameraActive, setCameraActive] = useState(true)
  const [microphoneActive, setMicrophoneActive] = useState(true)
  const [screenActive, setScreenActive] = useState(false)

  const handleCameraClick = () => {
    localStream.toggleTrack('video')
    setCameraActive(!cameraActive)
  }
  const handleMicrophoneClick = () => {
    localStream.toggleTrack('audio')
    setMicrophoneActive(!microphoneActive)
  }
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
  const handleShareScreen = () => {
    // 采集本地媒体流
    void localStream.getLocalScreenStream(mediaConstraints).then((screenStream) => {
      // 输出屏幕媒体流
      localStream.displayScreenStream(localVideoEl)

      setScreenActive(true)

      // 结束屏幕共享时切换回摄像头
      screenStream?.getVideoTracks()[0].addEventListener('ended', () => {
        void localStream.getLocalUserStream(mediaConstraints).then(() => localStream.displayUserStream(localVideoEl))

        setScreenActive(false)
      })
    })
  }

  return (
    <BaseFooter style={{ flexWrap: 'wrap' }}>
      <ControlButton icon={<CameraFilled />} tooltip={'camera'} active={cameraActive} onClick={handleCameraClick} />
      <ControlButton
        icon={<AudioFilled />}
        tooltip={'microphone'}
        active={microphoneActive}
        onClick={handleMicrophoneClick}
      />
      <RecordButton />
      <ControlButton icon={<RobotFilled />} tooltip={'screen'} active={screenActive} onClick={handleShareScreen} />
      <ControlButton icon={<StepBackwardFilled />} tooltip={'leave'} active={false} onClick={handleLeaveRoom} />
    </BaseFooter>
  )
}

const RecordButton = () => {
  const user = useUser()
  const { remoteStreams } = useRoomState()
  const username = user?.username ?? ''

  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([username])
  const [recordActive, setRecordActive] = useState(false)
  const [open, setOpen] = useState(false)
  const recorderMapRef = useRef<RecorderMap>(new Map())

  const recorderMap = recorderMapRef.current

  remoteStreams.forEach(({ username, stream }) => recorderMap.set(username, new MediaStreamRecorder(username, stream)))

  const handleRecordClick = () => {
    // 初始化本地用户的录制器
    if (!recorderMap.has(username)) {
      recorderMap.set(
        username,
        new MediaStreamRecorder(username, localStream.workingStream, { mimeType: 'video/webm;codecs=vp9' }),
      )
    }

    // 如果正在录制，则结束录制
    if (recordActive) {
      console.log(recorderMap)

      checkedList.forEach((username) => recorderMap.get(username as string)?.stop())

      setRecordActive(false)
      setOpen(false)
    } else {
      setOpen(true)
    }
  }

  // FIXME 实现录制功能
  const confirm = () => {
    // 开始录制
    checkedList.forEach((username) => {
      recorderMap.get(username as string)?.start()
    })

    setRecordActive(true)
    setOpen(false)
  }

  const cancel = () => setOpen(false)

  return (
    <Popconfirm
      open={open}
      placement='topLeft'
      title='Select the stream'
      description={
        <RecordCheckbox recorderMapRef={recorderMapRef} checkedList={checkedList} setCheckedList={setCheckedList} />
      }
      onConfirm={confirm}
      onCancel={cancel}
      okText='start'
      cancelText='cancel'
    >
      <ControlButton
        icon={<VideoCameraFilled />}
        tooltip={'record'}
        active={recordActive}
        onClick={handleRecordClick}
      />
    </Popconfirm>
  )
}

const RecordCheckbox = ({ recorderMapRef, checkedList, setCheckedList }: RecordCheckboxProps) => {
  const [indeterminate, setIndeterminate] = useState(true)
  const [checkAll, setCheckAll] = useState(false)

  const recorderMap = recorderMapRef.current
  const streamOptions = Array.from(recorderMap.keys())

  const handleCheckListChange = (list: CheckboxValueType[]) => {
    setCheckedList(list)
    setIndeterminate(!!list.length && list.length < streamOptions.length)
    setCheckAll(list.length === streamOptions.length)
  }

  const handleCheckAllChange = (e: CheckboxChangeEvent) => {
    setCheckedList(e.target.checked ? streamOptions : [])
    setIndeterminate(false)
    setCheckAll(e.target.checked)
  }

  return (
    <Space direction='vertical'>
      <Checkbox indeterminate={indeterminate} onChange={handleCheckAllChange} checked={checkAll}>
        Select all
      </Checkbox>
      <Checkbox.Group value={checkedList} onChange={handleCheckListChange}>
        {streamOptions.map((username) => {
          return (
            <Row key={username}>
              <Col>
                <Checkbox value={username}>{username}</Checkbox>
              </Col>
            </Row>
          )
        })}
      </Checkbox.Group>
    </Space>
  )
}
