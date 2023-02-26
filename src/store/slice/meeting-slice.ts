import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { message } from 'antd'
import { createMeeting } from '../../api/http/meeting'
import { CreateMeetingDto } from '../../types/meeting'
import { MeetingState, RootState, SetMeetingAction } from '../../types/store'

const initialState: MeetingState = {
  value: null,
}

export const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setMeeting(state, action: SetMeetingAction) {
      const meeting = { ...state.value, ...action.payload }
      state.value = meeting
    },
  },
})

/* =============== 异步 Action =============== */

export const createMeetingThunk = createAsyncThunk(
  'meeting/create',
  async (payload: CreateMeetingDto, { dispatch, rejectWithValue }) => {
    try {
      // 发送创建会议请求
      const meeting = await createMeeting(payload)
      // 全局设置 meeting
      dispatch(setMeeting(meeting))
      return meeting
    } catch (e: any) {
      await message.error(`${JSON.stringify(e.message)}`)
      return rejectWithValue(e)
    }
  },
)

export const { setMeeting } = meetingSlice.actions

export const meetingSelector = (state: RootState) => state.meeting.value

export const meetingReducer = meetingSlice.reducer
