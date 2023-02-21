import { PlusSquareOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons/lib/components/Icon'
import { Avatar, Button, Col, Row, Space } from 'antd'
import { BaseContent, BaseFooter, BaseHeader, PageContainer } from '../../components/layout'
import { Logo, StyledLink } from '../../components/lib'
import {
  LayoutContainer,
  MainContainer,
  MainContentContainer,
  RoomButton,
  RoomContainer,
  StyledHeader,
} from '../../components/room'
import { StyledParagraph } from '../../components/typography'
import { useAuthenticate, useInitSignalServer, useIsMeetingHost, useMeeting, useMount, useUser } from '../../hooks'
import { HOME_PATH } from '../../utils/constant'
// import { ReactComponent as HomeSvg } from '../../assets/home_fill.svg'
// import { ReactComponent as SettingSvg } from '../../assets/setting-fill.svg'
import { useNavigate } from 'react-router-dom'
import { signalEmitter } from '../../api/signal'
import { ReactComponent as Layout1Svg } from '../../assets/layout-1-fill.svg'
import { ReactComponent as Layout2Svg } from '../../assets/layout-2-fill.svg'
import { ReactComponent as Layout3Svg } from '../../assets/layout-3-fill.svg'

export const Room = () => {
  useAuthenticate()

  const isMeetingHost = useIsMeetingHost()
  const meeting = useMeeting()
  const user = useUser()
  const initSignalServer = useInitSignalServer()

  useMount(() => {
    // 如果用户是会议的主持人，则初始化信令服务器，并创建一个新的房间
    if (isMeetingHost) {
      // 初始化信令服务器
      void initSignalServer(user?.username ?? '').then(async () => {
        console.log(meeting?.id)
        // 使用 meeting.id 作为房间号，创建一个新的房间
        await signalEmitter.createRoom(meeting?.id ?? '')
      })
    }

    // TODO 建立 p2p 连接
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

  return (
    <BaseHeader>
      <Space className='logo-space'>
        <StyledLink to={HOME_PATH}>
          <Logo />
        </StyledLink>
        <StyledParagraph style={{ margin: '0 1.5em' }}>{meeting?.name}</StyledParagraph>
      </Space>
      <LayoutContainer>
        <RoomButton type='link' icon={<Icon component={Layout1Svg} />} />
        <RoomButton type='link' icon={<Icon component={Layout2Svg} />} />
        <RoomButton type='link' icon={<Icon component={Layout3Svg} />} />
      </LayoutContainer>
    </BaseHeader>
  )
}

const MainContent = () => {
  const attendsAvatar = Array(4).fill('https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png')

  return (
    <MainContentContainer>
      <StyledHeader>
        <Space>Record: 03:09</Space>
        <RoomButton type='link' icon={<PlusSquareOutlined />}>
          Add User
        </RoomButton>
      </StyledHeader>
      <Row gutter={[32, 32]} justify={'space-between'}>
        {attendsAvatar.map((avatar, idx) => {
          return (
            <Col span={12} key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar shape='square' size={64} src={avatar} />
            </Col>
          )
        })}
      </Row>
      <BaseFooter>
        {/* <Button>摄像头</Button>
        <Button>麦克风</Button>
        <Button>电话</Button>
        <Button>录音</Button>
        <Button>设置</Button> */}
        <ControlButtonGroup />
      </BaseFooter>
    </MainContentContainer>
  )
}

const ControlButtonGroup = () => {
  const user = useUser()
  const meeting = useMeeting()
  const navigate = useNavigate()

  const roomName = meeting?.id ?? ''
  const message = `Hello from ${user?.username ?? ''}`

  const handleSendMessage = () => {
    void (async () => {
      const res = await signalEmitter.sendMessage(roomName, message)
      console.log(res)
    })()
  }

  const handleCloseRoom = () => {
    void (async () => {
      await signalEmitter.closeRoom(roomName)
    })()

    navigate(HOME_PATH)
  }

  const handleLeaveRoom = () => {
    void (async () => {
      await signalEmitter.leaveRoom(roomName)
    })()

    navigate(HOME_PATH)
  }

  return (
    <Space>
      <Button onClick={handleSendMessage}>Send Message</Button>
      <Button onClick={handleCloseRoom}>Close Room</Button>
      <Button onClick={handleLeaveRoom}>Leave Room</Button>
    </Space>
  )
}

const Side = () => {
  return (
    <Space direction='vertical'>
      <BaseHeader>Header</BaseHeader>
      <BaseContent>Content</BaseContent>
    </Space>
  )
}
