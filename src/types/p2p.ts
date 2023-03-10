export interface PeerConnectionProps {
  username: string
  sid: string
  connectionConfig?: RTCConfiguration
  handleRemoteStream?: HandleRemoteStream
  handleRemoteText?: HandleRemoteChannel['handleRemoteText']
  handleRemoteFile?: HandleRemoteChannel['handleRemoteFile']
}

export type HandleRemoteStream = (remoteStream: RemoteStream) => void

export interface HandleRemoteChannel {
  handleRemoteText?: (res: { username: string; message: string }) => void
  handleRemoteFile?: (res: { username: string; file: File }) => void
}

export interface RemoteStream {
  username: string
  sid: string
  stream: MediaStream
}
