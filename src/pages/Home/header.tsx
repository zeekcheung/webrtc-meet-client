import { InfoCircleOutlined, LoginOutlined, LogoutOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Button, Popover, Space } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BaseHeader } from '../../components/layout'
import { Clock, Logo, StyledAvatar, StyledLink } from '../../components/lib'
import { StyledDivider } from '../../components/typography'
import { useAppDispatch, useUser } from '../../hooks'
import { logoutThunk } from '../../store/slice/user-slice'
import { HOME_PATH, PROFILE_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../../utils/constant'

export const HomeHeader = () => {
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

const PopoverList = () => {
  const [open, setOpen] = useState(false)
  const user = useUser()

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
