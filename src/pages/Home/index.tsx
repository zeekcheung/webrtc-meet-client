import {
  InfoCircleOutlined,
  LinkOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons'
import styled from '@emotion/styled'
import { Button, Form, Input, InputNumber, Modal, Popover, Space, Typography } from 'antd'
import Search from 'antd/es/input/Search'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { BaseContent, BaseFooter, BaseHeader, PageContainer } from '../../components/layout'
import { Clock, Logo, StyledAvatar, StyledLink } from '../../components/lib'
import { StyledDivider, StyledParagraph, StyledTitle } from '../../components/typography'
import { useMeeting } from '../../contexts/meeting-context'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { logoutThunk, userSelector } from '../../store/slice/user-slice'
import { NewMeetFormValue } from '../../types/form'
import { HOME_PATH, PROFILE_PATH, ROOM_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../../utils/constant'

export const Home = () => {
  return (
    <PageContainer>
      <Header />
      <Content />
      <Footer />
    </PageContainer>
  )
}

const Header = () => {
  return (
    <BaseHeader>
      <StyledLink to={HOME_PATH}>
        <Space size={'small'} className={'logo-space'}>
          <Logo />
          <span style={{ fontWeight: 'bold', fontSize: '2rem' }}>WebRTC Meet</span>
        </Space>
      </StyledLink>
      <Space size={'middle'}>
        <Clock />
        <PopoverList />
      </Space>
    </BaseHeader>
  )
}

const Content = () => {
  const handleSearch = (value: string) => {
    // TODO 通过链接加入房间
    console.log(value)
  }

  return (
    <BaseContent>
      <Typography style={{ paddingTop: '2em', paddingBottom: '1em' }}>
        <StyledTitle>Free Online Meeting</StyledTitle>
        <StyledTitle>
          Platform for <span>Everyone</span>
        </StyledTitle>
        <StyledParagraph>Nowadays, you can collaborate with people all over the world.</StyledParagraph>
      </Typography>
      <Space>
        <NewMeetingModal />
        <Search placeholder='Enter a link' prefix={<LinkOutlined />} allowClear onSearch={handleSearch} />
      </Space>
    </BaseContent>
  )
}

const Footer = () => {
  return <BaseFooter>@zeekcheung 2023.All right reserved</BaseFooter>
}

const PopoverList = () => {
  const [open, setOpen] = useState(false)
  const user = useAppSelector(userSelector)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <Popover
      content={<PopoverContent isAuthorized={Boolean(user)} />}
      trigger='click'
      placement='bottomRight'
      open={open}
      onOpenChange={handleOpenChange}
    >
      <StyledAvatar username={user?.nickname} />
    </Popover>
  )
}

const PopoverContent = ({ isAuthorized }: { isAuthorized: boolean }) => {
  const dispatch = useAppDispatch()

  const signOut = () => {
    void dispatch(logoutThunk())
  }

  return (
    <Space direction='vertical' style={{ fontWeight: '500 !important' }}>
      {isAuthorized ? (
        <>
          <Link to={PROFILE_PATH}>
            <Button type='text' icon={<InfoCircleOutlined />}>
              My Profile
            </Button>
          </Link>
          <StyledDivider />

          <Button type='text' icon={<LogoutOutlined />} onClick={signOut}>
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Link to={SIGN_UP_PATH}>
            <Button type='text' icon={<PlusCircleOutlined />}>
              Sign Up
            </Button>
          </Link>
          <StyledDivider />
          <Link to={SIGN_IN_PATH}>
            <Button type='text' icon={<LoginOutlined />}>
              Sign In
            </Button>
          </Link>
        </>
      )}
    </Space>
  )
}

const NewMeetingModal = () => {
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const meeting = useMeeting()

  const showModal = () => {
    setOpen(true)
  }

  const handleOk = () => {
    form
      .validateFields()
      .then((values: NewMeetFormValue) => {
        form.resetFields()
        // TODO 创建会议
        // console.log(values)
        const newMeeting = {
          ...values,
          beginTime: new Date().toUTCString(),
        }
        meeting.setValue(newMeeting)
        navigate(ROOM_PATH)
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      <Button type='primary' icon={<PlusSquareOutlined />} onClick={showModal}>
        New meeting
      </Button>
      <Modal
        title='Create a new meeting'
        okText='Create'
        cancelText='Cancel'
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <StyledForm form={form} name='new-meet'>
          <Form.Item
            name='name'
            label='Name'
            initialValue={uuidv4()}
            rules={[{ required: true, message: 'Please input the name of meeting!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name='password' label='Password' initialValue={''}>
            <Input.Password autoComplete='off' />
          </Form.Item>

          <Form.Item
            name='size'
            label='Size'
            initialValue={1}
            tooltip='Size represents the maximum number of attendees'
          >
            <InputNumber min={1} max={10} />
          </Form.Item>
        </StyledForm>
      </Modal>
    </>
  )
}

const StyledForm = styled(Form)`
  & .ant-form-item .ant-form-item-label {
    width: 5em;
  }
`
