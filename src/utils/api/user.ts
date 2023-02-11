import axios from 'axios'
import { request } from '.'
import { LoginDto, RegisterDto, User } from '../../types/user'
import { USER_BASE_URL } from '../constant'

const userClient = axios.create({
  baseURL: USER_BASE_URL,
})

export const register = async (registerDto: RegisterDto) => {
  return await request<RegisterDto, User>(userClient, {
    method: 'POST',
    url: '/register',
    data: registerDto,
  })
}

export const login = async (loginDto: LoginDto) => {
  return await request<LoginDto, User>(userClient, {
    method: 'POST',
    url: '/login',
    data: loginDto,
  })
}

export const logout = async () => {
  return await request(userClient, {
    method: 'GET',
    url: '/logout',
  })
}

export const getProfile = async () => {
  return await request<null, User>(userClient, {
    method: 'GET',
    url: 'profile',
  })
}
