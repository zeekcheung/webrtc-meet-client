import Icon, { FolderFilled, PlusSquareOutlined } from '@ant-design/icons'
import { Avatar, message, Space, Tooltip, Upload, UploadFile, UploadProps } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useState } from 'react'
import { pcMap } from '../../api/p2p'
import { ReactComponent as SendSvg } from '../../assets/send.svg'
import { BaseHeader } from '../../components/layout'
import { StyledAvatar } from '../../components/lib'
import { ChatListContainer, RoomButton, SideContainer, SideContentContainer } from '../../components/room'
import { useAppDispatch, useRoomState, useUser } from '../../hooks'
import { setRoomState } from '../../store/slice/room-slice'
import { copyContent } from '../../utils/room'

export const RoomSide = () => {
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

    pcMap.forEach((pc) => pc.sendTextMessage(message))
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
    // TODO 实现文件共享功能
    setFileList([...fileList, file])

    return false
  }

  return (
    <>
      <Upload fileList={fileList} onRemove={handleRemove} beforeUpload={handleBeforeUpload} showUploadList={false}>
        <RoomButton type='link' icon={<FolderFilled />}></RoomButton>
      </Upload>
    </>
  )
}
