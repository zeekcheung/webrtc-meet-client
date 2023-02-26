import { SignalServer } from '.'
import {
  HandleOtherJoinCallback,
  HandleOtherLeaveCallback,
  HandleReceiveMessageCallback,
  HandleRoomClosedCallback,
  RegisterHandlersProps,
} from '../../types/signal'

// const defaultCallback = (...args: any) => console.log(...args)
const defaultCallback = (...args: any) => {}

/**
 * 信令服务器到客户端的事件监听器
 */
export class SignalListener {
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
   * 处理其他用户加入房间
   */
  handleOtherJoin(callback: HandleOtherJoinCallback = defaultCallback) {
    // 其他用户加入房间
    this.socket?.on('other-join', (res) => {
      // 执行回调函数
      callback(JSON.parse(res))
    })
  }

  /**
   * 处理其他用户离开房间
   */
  handleOtherLeave(callback: HandleOtherLeaveCallback = defaultCallback) {
    // 其他用户离开房间
    this.socket?.on('other-leave', (res) => {
      callback(JSON.parse(res))
    })
  }

  /**
   * 处理房间被关闭
   */
  handleRoomClosed(callback: HandleRoomClosedCallback = defaultCallback) {
    // 房间已经被关闭
    this.socket?.on('room-closed', (res) => {
      callback(JSON.parse(res))
    })
  }

  handleReceiveMessage(callback: HandleReceiveMessageCallback = defaultCallback) {
    this.socket?.on('receive-message', (res) => {
      callback(JSON.parse(res))
    })
  }

  /**
   * 注册所有的事件处理函数
   */
  registerAllHandlers({
    handleOtherJoinCallback,
    handleOtherLeaveCallback,
    handleRoomClosedCallback,
    handleReceiveMessageCallback,
  }: RegisterHandlersProps = {}) {
    this.handleOtherJoin(handleOtherJoinCallback)
    this.handleOtherLeave(handleOtherLeaveCallback)
    this.handleRoomClosed(handleRoomClosedCallback)
    this.handleReceiveMessage(handleReceiveMessageCallback)
  }
}
