import { User } from './user'

export interface Meeting {
  id: string
  name: string // 会议名
  password?: string // 可选的密码
  size: number // 人数
  start_time?: string // 开始时间
  end_time?: string // 结束时间
  host: User // 主持人
  attends: User[] // 参会人
}

export type CreateMeetingDto = Pick<Meeting, 'name' | 'password' | 'size'> & {
  host_username: User['username'] // 主持人的用户名
}
