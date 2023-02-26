/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { message } from 'antd'
import { HandleRemoteStream } from '../../types/p2p'
import { Message } from '../../types/signal'
import { TURN_SERVER_PASSWORD, TURN_SERVER_URL1, TURN_SERVER_URL2, TURN_SERVER_USERNAME } from '../../utils/constant'
import { signalEmitter } from '../signal'
import { localStream } from './stream'

/**
 * p2p 连接
 *
 * 信令数据通过信令服务器（WebSocket）传输
 *
 * 媒体数据通过端对端连接（p2p）传输
 */
export class PeerConnection {
  /**
   * 与对端的 p2p 连接的实例
   */
  instance: RTCPeerConnection
  /**
   * 对端的 `socket.id`
   */
  sid: string

  /**
   * 1. 创建 `RTCPeerConnection` 实例
   *
   * 2. 将本机的 `candidate` 发送给对端
   *
   * 3. 将本机的媒体流发送给对端
   *
   * 4. 接收对端的媒体流
   *
   * @param sid 对端的 `socket.id`
   * @param connectionConfig p2p 连接配置
   * @param handleRemoteStream 接收到远端媒体流数据时执行的回调函数
   * @returns p2p 连接的实例
   */
  constructor(sid: string, connectionConfig?: RTCConfiguration, handleRemoteStream?: HandleRemoteStream) {
    this.sid = sid

    this.instance = this.createInstance(connectionConfig)

    this.transmitCandidates()

    if (localStream.instance === null) {
      void message.error('Can not get local stream, please allow permission.')
      throw new Error('local stream is null.')
    }
    this.addStreams(localStream.instance)

    this.listenRemoteStream(
      handleRemoteStream ??
        ((remoteStreams) => {
          console.log(remoteStreams)
        }),
    )
  }

  /**
   * 关闭 p2p 连接
   */
  close() {
    this.instance.close()
  }

  /**
   * 和对端进行媒体协商
   * @param options Offer SDP 的配置
   */
  async startNegotiate(options?: RTCOfferOptions) {
    const pc = this.instance
    const defaultOptions: RTCOfferOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    }

    try {
      // 本地创建 Offer SDP
      const offerSDP = await pc.createOffer({ ...defaultOptions, ...options })
      // 本地保存 Offer SDP
      await pc.setLocalDescription(offerSDP)
      // 将 Offer SDP 通过信令服务器发送给对端
      void signalEmitter.sendMessage(this.sid, offerSDP)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * 处理媒体协商数据（Offer SDP、Answer SDP、candidate）
   * @param message 媒体协商数据
   */
  async handleNegotiateMessage(message: Message) {
    const pc = this.instance
    const { type } = message

    // Offer SDP
    if (type === 'offer') {
      // 此时，本机是其他端的远端
      // 保存其他端的 Offer SDP
      const offerSDP = new RTCSessionDescription(message as RTCSessionDescriptionInit)
      void pc.setRemoteDescription(offerSDP)
      // 给其他端应答 Answer SDP
      try {
        const answerSDP = await pc.createAnswer()
        void pc.setLocalDescription(answerSDP)
        void signalEmitter.sendMessage(this.sid, answerSDP)
      } catch (error) {
        console.error(error)
      }
    }
    // Answer SDP
    else if (type === 'answer') {
      // 保存远端的 Answer SDP
      const answerSDP = new RTCSessionDescription(message as RTCSessionDescriptionInit)
      void pc.setRemoteDescription(answerSDP)
    }
    // candidate
    else if (type === 'candidate') {
      /**
       * 在双方都完成 `setLocalDescription` 之后，媒体协商完成，双方开始交换 candidate
       * - 本地通过 `onicecandidate` 事件从 TURN 服务器中获取到 candidate，然后通过信令服务器转发给对端
       * - 本地从信令服务器中接收到对端转发过来的 candidate 时，通过 `addIceCandidate` 方法将其保存到本地
       */

      // 创建对端的 candidate 实例
      const candidate = new RTCIceCandidate({
        candidate: message.candidate,
        sdpMLineIndex: message.sdpMLineIndex,
        sdpMid: message.sdpMid,
      })
      // 将对端的 candidate 添加到本地，
      void pc.addIceCandidate(candidate)
    }
  }

  /**
   * 将媒体流 `stream` 中的所有轨道都添加到该连接中
   * @param stream 媒体流
   */
  addStreams(stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      this.instance.addTrack(track, stream)
    })
  }

  /**
   * 移除所有添加到 p2p 连接的媒体轨
   */
  removeAllTracks() {
    const pc = this.instance
    const senders = pc?.getSenders()

    senders?.forEach((sender) => pc?.removeTrack(sender))

    return senders
  }

  /**
   * 创建 p2p 连接的实例
   * @param connectionConfig 连接配置
   * @returns p2p 连接的实例
   */
  private createInstance(connectionConfig?: RTCConfiguration) {
    // p2p 连接的默认配置
    const defaultConfig: RTCConfiguration = {
      // 配置 TURN 服务器
      iceServers: [
        {
          urls: [TURN_SERVER_URL1, TURN_SERVER_URL2],
          username: TURN_SERVER_USERNAME,
          credential: TURN_SERVER_PASSWORD,
        },
      ],
    }

    // 创建 p2p 连接的实例
    return new RTCPeerConnection({ ...defaultConfig, ...connectionConfig })
  }

  /**
   * 当 TURN 服务器发现本机的 candidate 时，通过信令服务器将其转发给对端
   * @param sid 对端的 `socket.id`
   */
  private transmitCandidates() {
    this.instance.onicecandidate = (e) => {
      const { candidate } = e
      if (candidate !== null) {
        // console.log(` Find a new candidate`, candidate)
        // 将 candidate 发送给对端
        void signalEmitter.sendMessage(this.sid, {
          type: 'candidate',
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
        })
      }
    }
  }

  /**
   * 监听远端的媒体流数据
   * @param handler 接收到远端媒体流数据时执行的回调函数
   */
  private listenRemoteStream(handler: HandleRemoteStream) {
    this.instance.ontrack = (e) => {
      handler({ sid: this.sid, remoteStream: e.streams[0] })
    }
  }
}

/**
 * 采用 `MESH` 架构，本端与每个对端都要创建一个 p2p 连接
 *
 * `pcMaps` 保存的是本端与所有对端的 p2p 连接
 *
 * key: `username`
 *
 * value: `PeerConnection`
 */
export const pcMaps = new Map<string, PeerConnection>()
