import { createSlice } from '@reduxjs/toolkit'
import { RoomReducers, RoomState, RootState } from '../../types/store'

const defaultMediaConstraints: MediaStreamConstraints = {
  video: {
    width: 1280,
    height: 720,
    frameRate: {
      ideal: 30,
      max: 60,
    },
    facingMode: 'user',
  },
  audio: {
    autoGainControl: false,
    echoCancellation: true,
    noiseSuppression: true,
  },
}

const initialState: RoomState = {
  roomName: '',
  userList: [],
  mediaConstraints: defaultMediaConstraints,
  remoteStreams: [],
  messageList: [],
}

export const roomSlice = createSlice<RoomState, RoomReducers, 'room'>({
  name: 'room',
  initialState,
  reducers: {
    // @ts-ignore
    setRoomState(state, action) {
      // 如果要直接替换整个 state，不能直接赋值，需要作为返回值
      return { ...state, ...action.payload }
    },
  },
})

export const { setRoomState } = roomSlice.actions

export const roomSelector = (state: RootState) => state.room

export const roomReducer = roomSlice.reducer

export const roomInitialState = initialState
