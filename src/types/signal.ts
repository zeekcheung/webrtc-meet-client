import { ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import { Meeting } from './meeting'
import { UserList } from './room'

/**
 * 服务端发送给客户端的所有事件
 */
export interface ServerToClientEvents {
  // key：事件名；value：箭头函数，参数为触发事件时携带的参数
  ['other-join']: (res: string) => void
  ['other-leave']: (res: string) => void
  ['room-closed']: (res: string) => void
  ['receive-message']: (res: string) => void
}

/**
 * 客户端发送给服务端的所有事件
 */
export interface ClientToServerEvents {
  ['bind-username']: (username: string, acknowledge: (res: string) => void) => void
  ['create-room']: (roomName: string, acknowledge: (res: string) => void) => void
  ['begin-join-room']: (body: { roomName: Meeting['id']; password: string }, acknowledge: (res: string) => void) => void
  ['complete-join-room']: (roomName: Meeting['id'], acknowledge: (res: string) => void) => void
  ['leave-room']: (roomName: string, acknowledge: (res: string) => void) => void
  ['close-room']: (roomName: string, acknowledge: (res: string) => void) => void
  ['broadcast-message']: (body: { roomName: string; message: unknown }, acknowledge: (res: string) => void) => void
  ['send-message']: (body: { sid: string; message: Message }, acknowledge: (res: string) => void) => void
}

export type Message = { type: RTCSdpType | 'candidate' } & Record<PropertyKey, any>

/**
 * 与信令服务器连接的 `Socket` 实例
 */
export type SignalSocket = Socket<ServerToClientEvents, ClientToServerEvents>

/**
 * 信令服务器的接口
 */
export interface ISignalServer {
  /**
   * 与信令服务器的 `Socket` 连接实例
   */
  socket: SignalSocket | null
  /**
   * 信令服务器的 uri
   */
  readonly _uri: string
  /**
   * 与信令服务器的连接配置
   */
  readonly _options: Partial<ManagerOptions & SocketOptions>
  /**
   * 构造函数
   */
  new (uri: ISignalServer['_uri'], options: ISignalServer['_options']): void
  /**
   * 连接信令服务器
   */
  connect: () => Promise<string>
  /**
   * 注册服务端到客户端的事件处理函数
   */
  registerAllHandlers: () => void
  /**
   * 初始化信令服务器
   * @param username 用户名
   * @returns socket.id
   */
  init: (username: string) => Promise<string>
  /**
   * 判断是否已经连接信令服务器
   * @returns 是否已经连接信令服务器
   */
  isConnected: () => boolean
  /**
   * 断开与信令服务器的连接
   */
  disconnect: () => void
}

export type HandleOtherJoinCallback = (res: { username: string; userList: UserList; updatedMeeting: Meeting }) => void

export type HandleOtherLeaveCallback = (res: { username: string; userList: UserList }) => void

export type HandleRoomClosedCallback = (res: Meeting) => void

export type HandleReceiveMessageCallback = (res: { username: string; message: Message; sid: string }) => any

export interface RegisterHandlersProps {
  handleOtherJoinCallback?: HandleOtherJoinCallback
  handleOtherLeaveCallback?: HandleOtherLeaveCallback
  handleRoomClosedCallback?: HandleRoomClosedCallback
  handleReceiveMessageCallback?: HandleReceiveMessageCallback
}

export interface ResetSignalHandlersProps {
  peerConnectionConfig?: RTCConfiguration
  offerSdpOptions?: RTCOfferOptions
}
