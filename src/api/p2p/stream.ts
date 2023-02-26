import { message } from 'antd'
import { PeerConnection } from '.'

/**
 * 本地采集的媒体流
 */
export class LocalStream {
  /**
   * 本地采集的媒体流的实例
   */
  instance: MediaStream | null = null

  /**
   * 采集本地的媒体流数据
   * @param constraints 媒体约束对象
   * @returns 采集到的媒体流对象
   */
  async getLocalMediaStream(constraints: MediaStreamConstraints) {
    if (navigator.mediaDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
      handleError(`navigator.mediaDevices.getUserMedia() is not supported!`)
    }

    try {
      // 采集本地的媒体流数据
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      // 将媒体流保存到全局，用于 p2p 连接
      this.instance = mediaStream
      return mediaStream
    } catch (error) {
      handleError(error)
    }
  }

  /**
   * // TODO 采集本地屏幕的媒体数据
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
      // 将媒体流保存到全局，用于 p2p 连接
      this.instance = mediaStream
      return mediaStream
    } catch (error) {
      handleError(error)
    }
  }

  /**
   * 将本地采集到的媒体流数据 `LocalStream.instance` 输出到本地的 `<video>` 元素 `localVideoEl`
   * @param outputVideoEl 输出媒体流数据的 `<video>` 元素
   * @returns `localStream`
   */
  displayLocalStream(outputVideoEl: HTMLVideoElement) {
    return (outputVideoEl.srcObject = this.instance)
  }

  /**
   * 停止采集媒体流
   */
  close() {
    this.instance?.getTracks()?.forEach((track) => {
      track.stop()
    })
    this.instance = null
  }

  /**
   * 将本地采集的媒体流添加到 p2p 连接中
   * @param pc p2p 连接
   */
  addTracksToPeerConnection(pc: PeerConnection) {
    const _localStream = this.instance
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
    const tracks = this.instance?.getTracks().filter((track) => track.kind === kind)
    tracks?.forEach((track) => (track.enabled = !track.enabled))
  }
}

function handleError(error: unknown) {
  void message.error(String(error))
}

/**
 * 本地采集的媒体流
 */
export const localStream = new LocalStream()
