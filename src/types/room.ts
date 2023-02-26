import { Dispatch } from 'react'

export interface VideoContainerProps {
  mediaConstraints: MediaStreamConstraints
}

export interface ControlButtonGroupProps {
  mediaConstraints: MediaStreamConstraints
  setMediaConstraints: Dispatch<React.SetStateAction<MediaStreamConstraints>>
}
