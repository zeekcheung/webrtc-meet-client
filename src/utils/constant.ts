// routes path
export const HOME_PATH = '/'
export const SIGN_UP_PATH = '/sign-up'
export const SIGN_IN_PATH = '/sign-in'
export const PROFILE_PATH = '/profile'
export const ROOM_PATH = '/room'

// api
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000/api'
export const USER_BASE_URL = API_BASE_URL + '/user'
export const MEETING_BASE_URL = API_BASE_URL + '/meeting'
