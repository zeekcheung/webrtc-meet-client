import { configureStore, isFulfilled } from '@reduxjs/toolkit'
import { meetingReducer } from './slice/meeting-slice'
import { roomReducer } from './slice/room-slice'
import { userReducer } from './slice/user-slice'

const store = configureStore({
  reducer: {
    user: userReducer,
    meeting: meetingReducer,
    room: roomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store

export const thunkIsFulfilled = isFulfilled()
