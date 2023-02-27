import { CaseReducer, SliceCaseReducers } from '@reduxjs/toolkit'
import store from '../store'
import { Meeting } from './meeting'
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
  userList: UserList
  mediaConstraints: MediaStreamConstraints
  remoteStreams: Array<{ sid: string; remoteStream: MediaStream }>
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
