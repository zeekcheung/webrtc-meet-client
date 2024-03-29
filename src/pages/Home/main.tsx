import { LinkOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { Button, Form, Input, InputNumber, message, Modal, Space, Typography } from 'antd'
import Search from 'antd/es/input/Search'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { signalEmitter, signalServer } from '../../api/signal'
import { BaseContent } from '../../components/layout'
import { StyledParagraph, StyledTitle } from '../../components/typography'
import { useAppDispatch, useUser } from '../../hooks'
import { thunkIsFulfilled } from '../../store'
import { createMeetingThunk, setMeeting } from '../../store/slice/meeting-slice'
import { setRoomState } from '../../store/slice/room-slice'
import { NewMeetFormValue } from '../../types/form'
import { ROOM_PATH } from '../../utils/constant'

export const HomeMain = () => {
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
        <JoinMeetingModal />
      </Space>
    </BaseContent>
  )
}

const NewMeetingModal = () => {
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useUser()

  const showModal = () => {
    if (user == null) {
      void message.warning(`You haven't signed in yet!`)
      return
    }
    setOpen(true)
  }

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values: NewMeetFormValue) => {
        form.resetFields()
        // 在数据库中创建会议
        const action = await dispatch(
          createMeetingThunk({
            ...values,
            host_username: user?.username as string,
          }),
        )
        // 会议创建成功之后，通过信令服务器创建一个新的房间
        if (thunkIsFulfilled(action)) {
          // 进入会议室页
          navigate(ROOM_PATH)
        }
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
        <Form form={form} name='new-meet'>
          <Form.Item
            name='name'
            label='Name'
            initialValue={uuidv4().split('-')[0]}
            rules={[{ required: true, message: 'Please input the name of meeting!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name='password' label='Password' initialValue={''} tooltip='Password is optional.'>
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
        </Form>
      </Modal>
    </>
  )
}

const JoinMeetingModal = () => {
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const user = useUser()
  const meetingIdRef = useRef('')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const showModal = () => {
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
  }

  const handleSearch = (meetingId: string) => {
    if (user == null) {
      void message.warning(`You haven't signed in yet!`)
      return
    }
    if (meetingId.length === 0) {
      void message.warning(`Please enter the meeting number.`)
      return
    }
    meetingIdRef.current = meetingId
    showModal()
  }

  const handleOk = () => {
    form
      .validateFields()
      .then(async ({ password }: { password: string }) => {
        form.resetFields()
        closeModal()

        const username = user?.username as string
        const meetingId = meetingIdRef.current
        const roomName = meetingId

        // 初始化信令服务器
        await signalServer.init(username)
        // 通过会议 id 加入房间
        try {
          const { username, userList } = await signalEmitter.beginJoinRoom(roomName, password)
          console.log(`${username} has joined room.`)
          console.log(`userList: ${userList}`)

          dispatch(setMeeting({ id: meetingId }))
          dispatch(setRoomState({ roomName, userList }))

          // 进入会议室页
          navigate(ROOM_PATH)
        } catch (e: any) {
          void message.error(e)
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }

  return (
    <>
      <Search placeholder='Enter a meeting number' prefix={<LinkOutlined />} onSearch={handleSearch} required />
      <Modal
        title='Enter the password of meeting'
        okText='Join'
        cancelText='Cancel'
        open={open}
        onOk={handleOk}
        onCancel={closeModal}
      >
        <Form form={form} name='join-meet'>
          <Form.Item name='password' label='Password' initialValue={''} tooltip='Password is optional.'>
            <Input.Password autoComplete='off' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
