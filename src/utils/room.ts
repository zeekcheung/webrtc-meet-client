import { pcMap } from '../api/p2p'
import { localStream } from '../api/p2p/stream'
import { signalServer } from '../api/signal'

export function createVideoElement(options?: Partial<HTMLVideoElement>) {
  const videoEl = document.createElement('video')
  const defaultOptions: Partial<HTMLVideoElement> = {
    autoplay: true,
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
 * 释放所有资源：
 *
 * 1. 停止采集媒体流
 *
 * 2. 断开所有 p2p 连接
 *
 * 3. 断开与信令服务器的连接
 *
 */
export function freeAllResource() {
  // 停止采集媒体流
  localStream.close()
  // 断开 p2p 连接
  pcMap.forEach((pc) => pc.close())
  pcMap.clear()
  // 断开与信令服务器的连接
  signalServer.disconnect()
}

/**
 * 释放与 `username` 对端的资源
 * @param username
 */
export function freeResourceWith(username: string) {
  // 断开 p2p 连接
  pcMap.get(username)?.close()
  // 清除 p2p 连接实例
  pcMap.delete(username)
}

export async function copyContent(content: string) {
  try {
    await navigator.clipboard.writeText(content)
  } catch (error) {
    console.error('Failed to copy: ', error)
  }
}

/**
 * 组装所有`Blob`片段，并获取对应的`URL`
 * @param chunks Blob 片段数组
 * @param options Blob 配置项
 * @returns url
 */
export function getUrlFromBlobChunks(chunks: Blob[], options?: BlobPropertyBag) {
  if (chunks.length === 0) {
    console.log('There is no blob data.')
    return ''
  }
  // 组装所有片段
  const blob = new Blob(chunks, options)
  // 创建 URL
  return URL.createObjectURL(blob)
}

/**
 * 下载`URL`对应的资源
 * @param url 资源 URL
 * @param filename 保存文件名
 */
export function downloadFromUrl(url: string, filename: string) {
  // 创建 <a> 元素
  const a = document.createElement('a')
  document.body.appendChild(a)
  a.style.display = 'none'
  a.href = url
  a.download = filename
  // 开始加载
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
