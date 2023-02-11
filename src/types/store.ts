import { PayloadAction } from '@reduxjs/toolkit'
import store from '../store'
import { User } from './user'

/* =============== root slice =============== */

export type AppDispatch = typeof store.dispatch

export type RootState = ReturnType<typeof store.getState>

/* =============== user slice =============== */

export interface UserState {
  value: User | null
}

export type SetUserAction = PayloadAction<UserState['value']>
