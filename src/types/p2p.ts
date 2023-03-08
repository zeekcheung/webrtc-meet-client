export interface PeerConnectionProps {
  username: string
  sid: string
  connectionConfig?: RTCConfiguration
  handleRemoteStream?: HandleRemoteStream
  handleRemoteText?: HandleRemoteChannel['handleRemoteText']
  handleRemoteFile?: HandleRemoteChannel['handleRemoteFile']
}

export type HandleRemoteStream = (res: { sid: string; remoteStream: MediaStream }) => void

export interface HandleRemoteChannel {
  handleRemoteText?: (res: { username: string; message: string }) => void
  handleRemoteFile?: (res: { username: string; file: File }) => void
}
