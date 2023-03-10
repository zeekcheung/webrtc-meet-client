import { message } from 'antd'
import { PeerConnection } from '.'
import { createVideoElement } from '../../utils/room'

/**
 * 本地采集的媒体流
 */
export class LocalStream {
  /**
   * 本地采集的用户媒体流的实例
   */
  userStream: MediaStream | null = null
  /**
   * 本地采集的屏幕媒体流的实例
   */
  screenStream: MediaStream | null = null

  /**
   * 采集本地的媒体流数据
   * @param constraints 媒体约束对象
   * @returns 采集到的媒体流对象
   */
  async getLocalUserStream(constraints: MediaStreamConstraints) {
    if (navigator.mediaDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
      handleError(`navigator.mediaDevices.getUserMedia() is not supported!`)
    }

    try {
      // 采集本地的媒体流数据
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      // 将媒体流保存到全局，用于 p2p 连接
      this.userStream = mediaStream
      return mediaStream
    } catch (error) {
      handleError(error)
    }
  }

  /**
   * 采集本地屏幕的媒体数据
   * @param constraints 媒体约束对象
   * @returns 屏幕数据的媒体流对象
   */
  async getLocalScreenStream(constraints: MediaStreamConstraints) {
    if (navigator.mediaDevices === undefined || navigator.mediaDevices.getDisplayMedia === undefined) {
      throw new Error(`navigator.mediaDevices.getDisplayMedia() is not supported!`)
    }

    try {
      // 采集本地屏幕的媒体流数据
      const mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints)
      // 保存媒体流，用于 p2p 连接
      this.screenStream = mediaStream
      return mediaStream
    } catch (error) {
      handleError(error)
    }
  }

  private displayLocalStream(type: 'user' | 'screen', outputVideoEl: HTMLVideoElement) {
    const mediaStream = type === 'user' ? this.userStream : this.screenStream
    return (outputVideoEl.srcObject = mediaStream)
  }

  /**
   * 将本地采集到的媒体流数据 `LocalStream.userStream` 输出到本地的 `<video>` 元素 `localVideoEl`
   * @param outputVideoEl 输出媒体流数据的 `<video>` 元素
   * @returns `localStream.userStream`
   */
  displayUserStream(outputVideoEl: HTMLVideoElement) {
    this.displayLocalStream('user', outputVideoEl)
  }

  /**
   * 将本地采集到的屏幕媒体流数据 `LocalStream.screenStream` 输出到本地的 `<video>` 元素 `localVideoEl`
   * @param outputVideoEl 输出媒体流数据的 `<video>` 元素
   * @returns `localStream.screenStream`
   */
  displayScreenStream(outputVideoEl: HTMLVideoElement) {
    this.displayLocalStream('screen', outputVideoEl)
  }

  /**
   * 获取正在的使用的媒体流
   * @returns `localStream.userStream | localStream.screenStream`
   */
  get workingStream() {
    const workingStream = localVideoEl.srcObject === this.userStream ? this.userStream : this.screenStream
    if (workingStream === null) {
      throw new Error('working stream is null.')
    }
    return workingStream
  }

  /**
   * 将本地采集的媒体流添加到 p2p 连接中
   * @param pc p2p 连接
   */
  addTracksToPeerConnection(pc: PeerConnection) {
    const _localStream = this.workingStream
    const _pc = pc.instance

    if (_localStream !== null && _pc !== null) {
      _localStream.getTracks().forEach((track) => {
        _pc.addTrack(track, _localStream)
      })
    }
  }

  /**
   * 切换媒体轨的启用状态
   * @param kind 媒体轨的类型
   */
  toggleTrack(kind: 'video' | 'audio') {
    const _localStream = this.workingStream
    const tracks = _localStream?.getTracks().filter((track) => track.kind === kind)
    tracks?.forEach((track) => (track.enabled = !track.enabled))
  }

  /**
   * 停止采集媒体流
   */
  close() {
    this.userStream?.getTracks()?.forEach((track) => {
      track.stop()
    })
    this.userStream = null
  }
}

function handleError(error: unknown) {
  void message.error(String(error))
}

/**
 * 本地采集的媒体流
 */
export const localStream = new LocalStream()

/**
 * 输出本地媒体流的 `video` 元素
 */
export const localVideoEl: HTMLVideoElement = createVideoElement()
