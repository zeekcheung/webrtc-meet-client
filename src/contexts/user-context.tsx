import { createContext } from '.'
import { User } from '../types/user'

export const {
  context: UserContext,
  Provider: UserProvider,
  useValue: useUser,
} = createContext<User | null>({
  defaultValue: null,
  initialValue: {
    username: 'zeek',
    nickname: 'zeek',
    register_time: Date.now().toLocaleString(),
  },
  displayName: 'UserContext',
})
