import { checkSocketConnection, signalServer, SignalServer } from '.'
import { Meeting } from '../../types/meeting'
import { User } from '../../types/user'

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
    const serializedRoom = await new Promise<string[]>((resolve, reject) => {
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
   * 加入房间名为 `roomName` 对应的房间
   * @param roomName 房间名
   * @param password 会议密码
   * @returns
   */
  @checkSocketConnection
  async joinRoom(roomName: string, password: string) {
    return await new Promise<Meeting>((resolve, reject) => {
      this.socket?.emit('join-room', { roomName, password }, (res) => {
        const parsedRes = JSON.parse(res)
        parsedRes.error !== undefined ? reject(parsedRes.message) : resolve(parsedRes)
      })
    })
  }

  /**
   * // TODO 离开房间名为 `roomName` 对应的房间
   * @param roomName 房间名
   */
  @checkSocketConnection
  async leaveRoom(roomName: string) {
    return await new Promise<{ username: string; room: User[] }>((resolve, reject) => {
      this.socket?.emit('leave-room', roomName, (res) => {
        resolve(JSON.parse(res))
        // 断开与信令服务器的连接
        signalServer.disconnect()
        // TODO 断开 p2p 连接
        // closePeerConnection()
      })
    })
  }

  /**
   * // TODO 关闭房间
   * @param roomName 房间名
   */
  @checkSocketConnection
  async closeRoom(roomName: string) {
    return await new Promise<Meeting>((resolve, reject) => {
      this.socket?.emit('close-room', roomName, (res) => {
        resolve(JSON.parse(res))
        // 断开与信令服务器的连接
        signalServer.disconnect()
        // TODO 断开 p2p 连接
        // closePeerConnection()
      })
    })
  }

  /**
   * 向 `roomName` 房间内的其他用户发送 `message` 消息（广播）
   * @param roomName 房间名
   * @param message 消息内容
   */
  @checkSocketConnection
  async sendMessage<M>(roomName: string, message: M) {
    return await new Promise<{ username: string; message: unknown }>((resolve, reject) => {
      this.socket?.emit('send-message', { roomName, message }, (res) => {
        resolve(JSON.parse(res))
      })
    })
  }
}
