// routes path
export const HOME_PATH = '/'
export const SIGN_UP_PATH = '/sign-up'
export const SIGN_IN_PATH = '/sign-in'
export const PROFILE_PATH = '/profile'
export const ROOM_PATH = '/room'

export type RoutePath = '/' | '/sign-up' | 'sign-in' | '/profile' | 'room'

// api
export const SERVER_URL = process.env.REACT_APP_SERVER_URL ?? 'http://localhost:3000'
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? `${SERVER_URL}/api`
export const USER_BASE_URL = API_BASE_URL + '/user'
export const MEETING_BASE_URL = API_BASE_URL + '/meeting'

// turn server
export const TURN_SERVER_URL1 = `turn:turn.zeekcheung.top:3478`
export const TURN_SERVER_URL2 = `turn:turn.zeekcheung.top:5349`
export const TURN_SERVER_USERNAME = 'demo'
export const TURN_SERVER_PASSWORD = '123456'

// environment
export const NODE_ENV = process.env.NODE_ENV
export const IS_DEV = NODE_ENV === 'development'
