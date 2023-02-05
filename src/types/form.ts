export interface SignUpFormValue {
  username: string
  nickname: string
  password: string
  confirm: string
}

export type SignInFormValue = Pick<SignUpFormValue, 'username' | 'password'>

export interface NewMeetFormValue {
  name: string // 会议名称
  size: number // 会议人数
  password: string // 会议密码
}

export type Meeting = NewMeetFormValue & {
  beginTime: string // 会议开始时间
  endTime?: string // 会议结束时间
}
