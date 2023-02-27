import { Dispatch } from 'react'

export interface VideoContainerProps {
  mediaConstraints: MediaStreamConstraints
  localVideoEl: HTMLVideoElement
}

export interface ControlButtonGroupProps {
  mediaConstraints: MediaStreamConstraints
  setMediaConstraints: Dispatch<React.SetStateAction<MediaStreamConstraints>>
  localVideoEl: HTMLVideoElement
}

export type UserList = Array<{ username: string; sid: string }>
