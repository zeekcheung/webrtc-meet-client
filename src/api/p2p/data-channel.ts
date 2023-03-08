/**
 * 文本数据和文件数据通过 p2p 连接的数据通道 `RTCDataChannel` 进行传输
 */

import { PeerConnection } from '.'
import { ChannelLabel } from '../../utils/constant'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DataChannel {
  static init(pc: PeerConnection, type: ChannelLabel) {
    const _pc = pc.instance
    // 创建 DataChannel 实例
    const dc = this.createDataChannel(_pc, type)
    dc.binaryType = 'arraybuffer'
    // 注册事件
    this.registerHandlers(dc)
    return dc
  }

  private static createDataChannel(
    pc: RTCPeerConnection,
    label: string,
    options: RTCDataChannelInit = { ordered: true },
  ) {
    return pc.createDataChannel(label, options)
  }

  private static registerHandlers(dc: RTCDataChannel) {
    dc.addEventListener('open', this.handleChannelOpen.bind(dc))
    dc.addEventListener('close', this.handleChannelClose.bind(dc))
    dc.addEventListener('message', this.handleChannelMessage.bind(dc))
  }

  private static handleChannelOpen(this: RTCDataChannel) {
    console.log(`${this.label}:${this.id} open!`)
  }

  private static handleChannelClose(this: RTCDataChannel) {
    console.log(`${this.label}:${this.id} closed!`)
  }

  private static handleChannelMessage(this: RTCDataChannel, e: MessageEvent<{ username: string; message: string }>) {
    console.log(`${this.label}:${this.id} receive message:`)
    console.log(e.data)
  }
}
