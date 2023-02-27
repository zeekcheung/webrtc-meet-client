import { createAsyncThunk, createSlice, SliceCaseReducers } from '@reduxjs/toolkit'
import { message } from 'antd'
import { createMeeting } from '../../api/http/meeting'
import { CreateMeetingDto } from '../../types/meeting'
import { MeetingState, RootState } from '../../types/store'

const initialState: MeetingState = null

export const meetingSlice = createSlice<MeetingState, SliceCaseReducers<MeetingState>>({
  name: 'meeting',
  initialState,
  reducers: {
    // @ts-ignore
    setMeeting(state, action) {
      return { ...state, ...action.payload }
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

export const meetingSelector = (state: RootState) => state.meeting

export const meetingReducer = meetingSlice.reducer
