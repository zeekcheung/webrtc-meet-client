import { pcMaps } from '../api/p2p'
import { localStream } from '../api/p2p/stream'
import { signalServer } from '../api/signal'

export function createVideoElement(options?: Partial<HTMLVideoElement>) {
  const videoEl = document.createElement('video')
  const defaultOptions: Partial<HTMLVideoElement> = {
    autoplay: true,
    width: 200,
    height: 200,
  }
  const optionsObj = { ...defaultOptions, ...options }
  Reflect.ownKeys(optionsObj).forEach((option) => {
    // eslint-disable-next-line
    // @ts-ignore
    videoEl[option] = optionsObj[option]
  })
  return videoEl
}

/**
 * 释放资源：
 *
 * 1. 停止采集媒体流
 *
 * 2. 断开所有 p2p 连接
 *
 * 3. 断开与信令服务器的连接
 *
 */
export function freeResource() {
  // 停止采集媒体流
  localStream.close()
  // 断开 p2p 连接
  pcMaps.forEach((pc) => pc.close())
  pcMaps.clear()
  // 断开与信令服务器的连接
  signalServer.disconnect()
}
