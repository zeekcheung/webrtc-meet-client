import { io, Socket } from 'socket.io-client'
import { SERVER_URL } from '../utils/constant'

const TURN_URL1 = `turn:turn.zeekcheung.top:3478`
const TURN_URL2 = `turn:turn.zeekcheung.top:5349`
const TURN_USERNAME = 'demo'
const TURN_PASSWORD = '123456'

const ROOM_NAME = '1v1 live room'

// client event log
const CONNECT_EVENT_LOG = /*    */ `=======  connected  =======`
const JOINED_EVENT_LOG = /*     */ `=======  joined     =======`
const OTHER_JOIN_EVENT_LOG = /* */ `=======  other-join =======`
const FULL_EVENT_LOG = /*       */ `=======  full       =======`
const LEAVED_EVENT_LOG = /*     */ `=======  leaved     =======`
const BYE_EVENT_LOG = /*        */ `=======  bye        =======`
const MESSAGE_EVENT_LOG = /*    */ `=======  message    =======`
const DISCONNECT_EVENT_LOG = /* */ `=======  disconnect =======`

/**
 * 本地采集的媒体流
 */
let localStream: MediaStream

/**
 * 客户端与 Socket.IO 服务器的连接实例；
 *
 * 信令数据通过信令服务器（Socket.IO）进行传输；
 */
let socket: Socket

/**
 * 客户端与 Socket.IO 服务器连接状态
 */
let state: 'init' | 'joined_conn' | 'joined' | 'joined_unbind' | 'leaved' = 'init'

/**
 * p2p 连接的实例；
 *
 * 媒体数据通过 p2p 连接进行传输；
 */
let pc: RTCPeerConnection

/**
 * 连接信令服务器，并接收信令消息
 */
export function connSignalServer() {
  // 连接信令服务器（同域）
  socket = io(SERVER_URL)
  // 注册事件处理函数，接收来自服务器的信令消息
  try {
    registerEventHandler()
  } catch (error) {
    handleError(error)
  }
}

/**
 * 注册事件处理函数，接收来自服务器的信令消息
 */
export function registerEventHandler() {
  if (socket == null) {
    throw new Error('socket is null!')
  }

  socket.on('connect', () => {
    console.log(CONNECT_EVENT_LOG)
    console.log(`socket: `, socket)

    if (socket == null) {
      throw new Error('socket is null!')
    }

    // 成功加入房间
    socket.on('joined', (room) => {
      console.log(JOINED_EVENT_LOG)
      console.log('room: ', room)

      // 更新客户端状态
      state = 'joined'

      // 加入房间后，建立端对端连接
      createPeerConnection()

      // callBtn.disabled = true
      // hangupBtn.disabled = false

      console.log(`Client State: ${state}`)
    })

    // 其他客户端加入房间
    socket.on('other-join', (otherSocketId, room) => {
      console.log(OTHER_JOIN_EVENT_LOG)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`otherSocketId: ${otherSocketId}`)
      console.log('room: ', room)

      /**
       * 注意:joined_unbind 状态需要创建新的端对端连接
       */
      if (state === 'joined_unbind') {
        createPeerConnection()
      }

      // 更新客户端状态
      state = 'joined_conn'
      // 有其他客户端加入时，进行媒体协商
      void negotiate()

      console.log(`Client State: ${state}`)
    })

    // 房间人数已满
    socket.on('full', (room) => {
      console.log(FULL_EVENT_LOG)
      console.log('room: ', room)

      // 更新客户端状态
      state = 'leaved'
      console.log(`Client State: ${state}`)

      // 断开连接，虽然没有加入房间，但是仍然存在与服务器的连接
      socket.disconnect()

      // callBtn.disabled = false
      // hangupBtn.disabled = true
    })

    // 成功离开房间
    socket.on('leaved', () => {
      console.log(LEAVED_EVENT_LOG)

      // 更新客户端状态
      state = 'leaved'
      console.log(`Client State: ${state}`)

      // 断开与信令服务器的连接
      socket.disconnect()
      // 断开端对端连接
      closePeerConnection()

      // callBtn.disabled = false
      // hangupBtn.disabled = true
    })

    // 其他客户端离开房间
    socket.on('bye', (leavedSocketId, room) => {
      console.log(BYE_EVENT_LOG)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`leavedSocketId: ${leavedSocketId}`)
      console.log('room: ', room)

      // 更新客户端状态
      state = 'joined_unbind'
      console.log(`Client State: ${state}`)
    })

    // 转发媒体协商数据（Offer SDP、Answer SDP、candidate）
    socket.on('message', async (data) => {
      console.log(MESSAGE_EVENT_LOG)
      console.log(`data: `, data)

      const { type } = data
      // Offer SDP
      if (type === 'offer') {
        // 此时，本机是其他端的远端
        // 保存其他端的 Offer SDP
        const offerSDP = new RTCSessionDescription(data)
        void pc.setRemoteDescription(offerSDP)
        // 给其他端应答 Answer SDP
        try {
          const answerSDP = await pc.createAnswer()
          void pc.setLocalDescription(answerSDP)
          sendMessageToRoom(ROOM_NAME, answerSDP)
        } catch (error) {
          handleError(error)
        }
      }
      // Answer SDP
      else if (type === 'answer') {
        // 保存远端的 Answer SDP
        const answerSDP = new RTCSessionDescription(data)
        void pc.setRemoteDescription(answerSDP)
      }
      // candidate
      else if (type === 'candidate') {
        /**
         * 在双方都完成 `setLocalDescription` 之后，双方开始交换 candidate
         * - 本地通过 `onicecandidate` 事件从 TURN 服务器中获取到 candidate，然后通过信令服务器转发给远端
         * - 本地从信令服务器中接收到远端转发过来的 candidate 时，通过 `addIceCandidate` 方法将其保存到本地
         */

        // 创建对端的 candidate 实例
        const candidate = new RTCIceCandidate({
          candidate: data.candidate,
          sdpMLineIndex: data.sdpMLineIndex,
          sdpMid: data.sdpMid,
        })
        // 将对端的 candidate 添加到本地，
        void pc.addIceCandidate(candidate)
      }
      // 其他类型消息
      else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`the message is invalid!\ndata:${data}`)
      }
    })
  })

  socket.on('disconnect', (reason) => {
    console.log(DISCONNECT_EVENT_LOG)
    console.log(`reason: ${reason}`)
  })
}

/**
 * 创建端对端连接 `RTCPeerConnection`，并交换 candidate
 *
 * 将本地媒体流加入到连接中，并接收远端媒体流
 */
function createPeerConnection() {
  // 创建端对端连接
  if (pc == null) {
    const config: RTCConfiguration = {
      // 配置 TURN 服务器
      iceServers: [
        {
          urls: [TURN_URL1, TURN_URL2],
          username: TURN_USERNAME,
          credential: TURN_PASSWORD,
        },
      ],
    }
    // 创建端对端连接实例
    pc = new RTCPeerConnection(config)

    // 接收到来自 TURN 服务器的 candidate 之后，将其转发给远端
    pc.onicecandidate = (e) => {
      const { candidate } = e
      if (candidate != null) {
        console.log(`Find a new candidate`, candidate)

        // 将 candidate 转发给远端
        sendMessageToRoom(ROOM_NAME, {
          type: 'candidate',
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
        })
      }
    }

    // 接收来自远端的媒体数据
    pc.ontrack = (e) => {
      // e.streams 中包含所有远端的媒体流
      // remoteVideoEl.srcObject = e.streams[0]
    }
  }

  // 将媒体流添加到端对端连接中
  if (localStream != null) {
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })
  }
}

/**
 * 向 `room` 房间中广播 `message` 消息
 * @param {string} roomName 房间名
 * @param {any} message 消息的具体内容
 */
function sendMessageToRoom(roomName: string, message: any) {
  if (socket == null) {
    throw new Error('The client has not yet connected to the server')
  }
  socket.emit('message', roomName, message)
}

/**
 * 媒体协商
 */
async function negotiate() {
  if (state === 'joined_conn' && pc != null) {
    const options: RTCOfferOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    }

    try {
      // 本地创建 Offer SDP
      const offerSDP = await pc.createOffer(options)
      // 本地保存 Offer SDP
      void pc.setLocalDescription(offerSDP)
      // 将 Offer SDP 通过信令服务器发送给远端
      sendMessageToRoom(ROOM_NAME, offerSDP)
    } catch (error) {
      handleError(error)
    }
  }
}

/**
 * 关闭端对端连接
 */
export function closePeerConnection() {
  if (pc != null) {
    pc.close()
    // pc = null
  }
}

/**
 * 离开房间
 */
export function hangup() {
  if (socket != null) {
    socket.emit('leave', ROOM_NAME)
  }

  // 释放资源
  closePeerConnection()
  closeLocalMedia()

  // callBtn.disabled = false
  // hangupBtn.disabled = true
}

/**
 * 停止采集媒体流
 */
export function closeLocalMedia() {
  localStream?.getTracks()?.forEach((track) => {
    track.stop()
  })
  // localStream = null
}

function handleError(err: unknown) {
  console.error(err)
}
