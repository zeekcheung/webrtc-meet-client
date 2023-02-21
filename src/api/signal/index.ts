import { io, ManagerOptions, SocketOptions } from 'socket.io-client'
import { RegisterHandlersProps, SignalSocket } from '../../types/signal'
import { SERVER_URL } from '../../utils/constant'
import { SignalEmitter } from './client-to-server-events'
import { SignalListener } from './server-to-client-events'

/**
 * 信令服务器
 */
export class SignalServer {
  /**
   * 与信令服务器的 `Socket` 连接实例
   */
  socket: SignalSocket | null = null
  /**
   * 信令服务器的 uri
   */
  private readonly _uri: string
  /**
   * 与信令服务器的连接配置
   */
  private readonly _options: Partial<ManagerOptions & SocketOptions>

  constructor(uri: string = SERVER_URL, options: Partial<ManagerOptions & SocketOptions> = {}) {
    this._uri = uri
    this._options = options
    this.socket = null
  }

  /**
   * 连接信令服务器
   */
  async connect() {
    const socketId = await new Promise<string>((resolve, reject) => {
      try {
        // 连接信令服务器
        this.socket = io(this._uri, this._options)
        this.socket.on('connect', () => {
          // 连接成功的话，更新 signalEmitter 和 signalListener 内的 socket 实例
          signalEmitter.socket = signalListener.socket = this.socket
          // 返回 socket.id
          resolve(this.socket?.id ?? '')
        })
      } catch (e) {
        reject(e)
      }
    })

    return socketId
  }

  /**
   * 断开与信令服务器的连接
   */
  @checkSocketConnection
  disconnect() {
    /**
     * 离开会议室时，需要手动断开与信令服务器的连接
     * 否则，刷新了整个页面之后，App 的数据已经丢失了
     * 但是，浏览器仍然保留着与信令服务器的连接，数据无法与 App 同步
     */
    this.socket?.disconnect()

    if (this.socket?.connected === false) {
      console.log('io client has disconnected.')
    }

    // 重置 socket 为 null
    signalEmitter.socket = signalListener.socket = this.socket = null
  }

  /**
   * 初始化信令服务器
   * @param username 用户名
   * @returns socket.id
   */
  async init(username: string, handlersCallback?: RegisterHandlersProps) {
    // 如果已经连接上了信令服务器，则不需要再重复连接
    if (this.socket?.connected === true) {
      return this.socket?.id
    }
    // 连接信令服务器
    const socketId = await this.connect()
    // 绑定username
    await signalEmitter.bindUsername(username)
    // 注册相关的事件处理函数
    signalListener.registerAllHandlers(handlersCallback)
    return socketId
  }
}

/**
 * 判断信令服务器是否已经连接的 `method decorator`
 * @param _target 如果是静态方法，`target`是`SignalServer`的构造函数；如果是实例方法，`target`是`SignalServer`的原型对象
 * @param _propertyKey 方法的属性名
 * @param descriptor 方法的属性描述符对象
 */
export function checkSocketConnection<T extends SignalServer | SignalEmitter>(
  _target: T,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  /**
   * method decorator 只会在方法被定义时调用，在方法执行时不会调用
   *
   * 当方法被定义时，通过该装饰器给该方法添加上判断信令服务器是否已经连接的逻辑
   */
  const methodValue = descriptor.value
  // 重写方法
  descriptor.value = function (this: T, ...args: any[]) {
    // 判断信令服务器是否已经连接
    if (this.socket?.connected === false) {
      console.error('io client has not connected.')
    }
    // 执行原方法（透传 this 和参数，并返回执行结果）
    return methodValue.apply(this, args)
  }
}

export const signalServer = new SignalServer()

export const signalEmitter = new SignalEmitter(signalServer)

export const signalListener = new SignalListener(signalServer)
