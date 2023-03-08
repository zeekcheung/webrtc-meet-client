import { createSlice } from '@reduxjs/toolkit'
import { RoomReducers, RoomState, RootState } from '../../types/store'

const initialState: RoomState = {
  roomName: '',
  userList: [],
  // mediaConstraints: { video: true, audio: true },
  mediaConstraints: { video: true, audio: false },
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
