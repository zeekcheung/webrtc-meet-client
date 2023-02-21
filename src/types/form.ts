import { Meeting } from './meeting'

export interface SignUpFormValue {
  username: string
  nickname: string
  password: string
  confirm: string
}

export type SignInFormValue = Pick<SignUpFormValue, 'username' | 'password'>

export interface NewMeetFormValue {
  name: Meeting['name'] // 会议名称
  size: Meeting['size'] // 会议人数
  password?: Meeting['password'] // 会议密码
}
