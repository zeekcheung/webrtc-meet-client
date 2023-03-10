import { downloadFromUrl, getUrlFromBlobChunks } from '../../utils/room'

/**
 * 媒体流的录制器
 */
export class MediaStreamRecorder {
  private readonly username: string
  /**
   * 录制器的实例
   */
  private readonly recorder: MediaRecorder
  /**
   * 媒体录制的数据块
   */
  private readonly recordedChunks: Blob[] = []

  private readonly defaultOptions: MediaRecorderOptions

  constructor(username: string, stream: MediaStream, options?: MediaRecorderOptions) {
    this.username = username
    this.defaultOptions = this.initDefaultOptions(options)
    const recorder = (this.recorder = new MediaRecorder(stream, options))

    // 注册事件
    recorder.ondataavailable = this.handleDataAvailable.bind(this)
    recorder.onstart = this.handleRecordStart.bind(this)
    recorder.onstop = this.handleRecordStop.bind(this)
  }

  /**
   * 开始录制
   */
  start() {
    this.recorder.start()
  }

  /**
   * 结束录制
   */
  stop() {
    this.recorder.stop()
  }

  private initDefaultOptions(options?: MediaRecorderOptions): MediaRecorderOptions {
    const vp9 = 'video/webm;codecs=vp9'
    const canRecordVp9 = MediaRecorder.isTypeSupported(vp9)

    return {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      mimeType: canRecordVp9 ? vp9 : 'video/webm',
      ...options,
    }
  }

  private handleRecordStart() {
    console.log(`start to record ${this.username}'s stream.`)
  }

  private handleDataAvailable(e: BlobEvent) {
    this.recordedChunks.push(e.data)
  }

  private handleRecordStop() {
    console.log(`stop to record ${this.username}'s stream.`)
    /**
     * 录制结束后下载到本地
     */
    const url = getUrlFromBlobChunks(this.recordedChunks, { type: this.defaultOptions.mimeType })
    downloadFromUrl(url, `${this.username}_record`)

    this.recordedChunks.length = 0
  }
}
