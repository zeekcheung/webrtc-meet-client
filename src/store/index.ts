import { configureStore, PayloadAction } from '@reduxjs/toolkit'
import { userReducer } from './slice/user-slice'

const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

export default store

export const thunkIsFulfilled = (
  action: PayloadAction<any> & {
    meta: { requestStatus: 'fulfilled' | 'rejected' }
  },
) => action.meta.requestStatus === 'fulfilled'
