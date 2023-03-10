import { CaseReducer, SliceCaseReducers } from '@reduxjs/toolkit'
import store from '../store'
import { Meeting } from './meeting'
import { RemoteStream } from './p2p'
import { UserList } from './room'
import { User } from './user'

/* =============== root slice =============== */

export type AppDispatch = typeof store.dispatch

export type RootState = ReturnType<typeof store.getState>

/* =============== user slice =============== */

export type UserState = User | null

export interface UserReducers extends SliceCaseReducers<UserState> {
  setUser: CaseReducer<
    UserState,
    {
      payload: Partial<UserState>
      type: string
    }
  >
}

/* =============== meeting slice =============== */

export type MeetingState = Partial<Meeting> | null

export interface MeetingReducers extends SliceCaseReducers<MeetingState> {
  setMeeting: CaseReducer<
    MeetingState,
    {
      payload: Partial<MeetingState>
      type: string
    }
  >
}

/* =============== room slice =============== */

export interface RoomState {
  roomName: string
  userList: UserList
  mediaConstraints: MediaStreamConstraints
  remoteStreams: RemoteStream[]
  messageList: Array<{ username: string; message: string; date: string }>
}

export interface RoomReducers extends SliceCaseReducers<RoomState> {
  setRoomState: CaseReducer<
    RoomState,
    {
      payload: Partial<RoomState>
      type: string
    }
  >
}
