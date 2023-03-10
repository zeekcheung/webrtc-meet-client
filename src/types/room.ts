import { CheckboxValueType } from 'antd/es/checkbox/Group'
import { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { MediaStreamRecorder } from '../api/p2p/record'

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

export type RecorderMap = Map<string, MediaStreamRecorder>

export interface RecordCheckboxProps {
  recorderMapRef: MutableRefObject<RecorderMap>
  checkedList: CheckboxValueType[]
  setCheckedList: Dispatch<SetStateAction<CheckboxValueType[]>>
}
