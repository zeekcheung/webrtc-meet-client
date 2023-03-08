import { checkSocketConnection, SignalServer } from '.'
import { Meeting } from '../../types/meeting'
import { UserList } from '../../types/room'

/**
 * 客户端到信令服务器的事件触发器
 */
export class SignalEmitter {
  /**
   * 与信令服务器的 `Socket` 连接实例
   */
  socket: SignalServer['socket'] = null

  /**
   * @param signalServer 信令服务器实例
   */
  constructor(signalServer: SignalServer) {
    this.socket = signalServer.socket
  }

  /**
   * 为用户的`socket`实例绑定`username`
   * @param username 用户名
   * @returns 用户名
   */
  @checkSocketConnection
  async bindUsername(username: string) {
    return await new Promise<string>((resolve, reject) => {
      this.socket?.emit('bind-username', username, (res) => {
        resolve(res)
      })
    })
  }

  /**
   * 创建房间名为 `roomName` 的房间
   * @param roomName 房间名
   * @returns 创建的新房间
   */
  @checkSocketConnection
  async createRoom(roomName: string) {
    const serializedRoom = await new Promise<UserList>((resolve, reject) => {
      try {
        this.socket?.emit('create-room', roomName, (serializedRoom) => {
          resolve(JSON.parse(serializedRoom))
        })
      } catch (e) {
        reject(e)
      }
    })

    // 返回经过序列化的房间
    return serializedRoom
  }

  /**
   * 开始加入房间名为 `roomName` 对应的房间：
   *
   * 判断能否加入房间，如果可以的话，就先加入信令服务器的房间
   * @param roomName 房间名
   * @param password 会议密码
   * @returns
   */
  @checkSocketConnection
  async beginJoinRoom(roomName: string, password: string) {
    return await new Promise<{ username: string; userList: Array<{ username: string; sid: string }> }>(
      (resolve, reject) => {
        this.socket?.emit('begin-join-room', { roomName, password }, (res) => {
          const parsedRes = JSON.parse(res)
          parsedRes.error !== undefined ? reject(parsedRes.message) : resolve(parsedRes)
        })
      },
    )
  }

  /**
   * 完成加入房间名为 `roomName` 对应的房间：
   *
   * 更新数据库中会议参与者的数据，并通知房间内其他用户有新用户加入房间
   * @param roomName 房间名
   * @returns
   */
  @checkSocketConnection
  async completeJoinRoom(roomName: string) {
    return await new Promise<{ username: string; userList: string[]; updatedMeeting: Meeting }>((resolve, reject) => {
      this.socket?.emit('complete-join-room', roomName, (res) => {
        const parsedRes = JSON.parse(res)
        resolve(parsedRes)
      })
    })
  }

  /**
   * 离开房间名为 `roomName` 对应的房间
   * @param roomName 房间名
   */
  @checkSocketConnection
  async leaveRoom(roomName: string) {
    return await new Promise<{ username: string; userList: string[] }>((resolve, reject) => {
      this.socket?.emit('leave-room', roomName, (res) => {
        resolve(JSON.parse(res))
      })
    })
  }

  /**
   * 关闭房间
   * @param roomName 房间名
   */
  @checkSocketConnection
  async closeRoom(roomName: string) {
    return await new Promise<Meeting>((resolve, reject) => {
      this.socket?.emit('close-room', roomName, (res) => {
        resolve(JSON.parse(res))
      })
    })
  }

  /**
   * 向 `roomName` 房间内的其他用户广播 `message` 消息
   * @param roomName 房间名
   * @param message 消息内容
   */
  @checkSocketConnection
  async broadcastMessage(roomName: string, message: unknown) {
    return await new Promise<{ username: string; message: unknown }>((resolve, reject) => {
      this.socket?.emit('broadcast-message', { roomName, message }, (res) => {
        resolve(JSON.parse(res))
      })
    })
  }

  /**
   * 向 `socket.id` 为 `sid` 的用户发送 `message` 消息
   * @param sid `socket.id`
   * @param message 消息内容
   */
  @checkSocketConnection
  async sendMessage(sid: string, message: { type: RTCSdpType | 'candidate' } & Record<PropertyKey, any>) {
    return await new Promise<{ username: string; message: unknown }>((resolve, reject) => {
      this.socket?.emit('send-message', { sid, message }, (res) => {
        resolve(JSON.parse(res))
      })
    })
  }
}
