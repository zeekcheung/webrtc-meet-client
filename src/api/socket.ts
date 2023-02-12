import { io } from 'socket.io-client'
import { SERVER_URL } from '../utils/constant'

export const socket = io(SERVER_URL)
