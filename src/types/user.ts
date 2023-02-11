export interface User {
  username: string // 用户名
  nickname: string // 昵称
  password?: string // 密码
  register_time: string // 注册时间
}

export type RegisterDto = Omit<User, 'register_time'>

export type LoginDto = Omit<RegisterDto, 'nickname'>

export interface HttpException {
  error: string // 原因短语
  message: string // 具体消息
  statusCode: number // 状态码
}
