import { configureStore, isFulfilled } from '@reduxjs/toolkit'
import { meetingReducer } from './slice/meeting-slice'
import { userReducer } from './slice/user-slice'

const store = configureStore({
  reducer: {
    user: userReducer,
    meeting: meetingReducer,
  },
})

export default store

export const thunkIsFulfilled = isFulfilled()
