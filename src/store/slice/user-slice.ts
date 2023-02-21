import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { message } from 'antd'
import { getProfile, login, logout, register } from '../../api/http/user'
import { RootState, SetUserAction, UserState } from '../../types/store'
import { LoginDto, RegisterDto } from '../../types/user'

const initialState: UserState = {
  value: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: SetUserAction) {
      state.value = action.payload
    },
  },
})

/* =============== 异步 Action =============== */

export const registerThunk = createAsyncThunk('user/register', async (payload: RegisterDto, { rejectWithValue }) => {
  try {
    // 发送注册请求
    const user = await register(payload)

    // 打开成功通知窗口
    message.config({ duration: 3 })
    await message.success('Sign up successfully!')

    return user
  } catch (e: any) {
    await message.error(`${JSON.stringify(e.message)}`)
    return rejectWithValue(e)
  }
})

export const loginThunk = createAsyncThunk('user/login', async (payload: LoginDto, { dispatch, rejectWithValue }) => {
  try {
    // 发送登录请求
    const user = await login(payload)

    message.config({ duration: 1 })
    await message.success('Sign in successfully!')

    // 全局设置 user
    dispatch(setUser(user))

    return user
  } catch (e: any) {
    // 捕获请求异常
    await message.error(`${JSON.stringify(e.message)}`)
    return rejectWithValue(e)
  }
})

export const logoutThunk = createAsyncThunk('user/logout', async (_, { dispatch, rejectWithValue }) => {
  try {
    await logout()

    message.config({ duration: 1 })
    await message.success('Sign out successfully!')

    // 更新全局的 User
    dispatch(setUser(null))
  } catch (e: any) {
    await message.error(`${JSON.stringify(e.message)}`)
    return rejectWithValue(e)
  }
})

export const getProfileThunk = createAsyncThunk('user/getProfile', async (_, { dispatch, rejectWithValue }) => {
  try {
    // 请求用户信息
    const user = await getProfile()
    // 全局设置用户信息
    dispatch(setUser(user))
  } catch (e) {
    console.log(`User has not logged in yet!`)
    rejectWithValue(e)
  }
})

export const { setUser } = userSlice.actions

export const userSelector = (state: RootState) => state.user.value

export const userReducer = userSlice.reducer
