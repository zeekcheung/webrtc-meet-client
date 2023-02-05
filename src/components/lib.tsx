import styled from '@emotion/styled'
import { Avatar, AvatarProps, Button } from 'antd'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/webrtc-logo.png'
import { getTimeFromDate, useCurrDate } from '../utils/date'
import { getRandomIntInclusive } from '../utils/lib'

export const StyledButton = styled(Button)`
  margin-top: 1em;
  background: linear-gradient(45deg, #bb3fdc, #ff9f7c);
  color: #fff;
  font-weight: bold;
  border: 1px solid black;

  &:hover {
    & span {
      color: #69b1ff !important;
    }
  }
`

export const StyledLink = styled(NavLink)`
  color: #fff;

  &:hover {
    color: #69b1ff;
  }
`

export const StyledAvatar = ({ username, ...rest }: { username?: string } & AvatarProps) => {
  const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae']
  const defaultBgcolor = ColorList[getRandomIntInclusive(0, ColorList.length - 1)]

  return useMemo(
    () => (
      <Avatar style={{ backgroundColor: defaultBgcolor }} {...rest}>
        {username ?? 'U'}
      </Avatar>
    ),
    [username],
  )
}

export const Logo = () => {
  return <img src={logo} alt='logo' width={'32'} />
}

export const Clock = () => {
  const currDate = useCurrDate()
  const { hour, minute, weekday, day, month } = getTimeFromDate(currDate)

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const _minute = `${minute < 10 ? '0' + minute : minute}`

  const currTime = `${hour}:${_minute} · ${weekday}, ${day} ${month}`
  return <span style={{ fontWeight: 'bold' }}>{currTime}</span>
}
