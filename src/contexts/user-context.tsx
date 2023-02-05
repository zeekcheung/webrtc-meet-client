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
    signUpTime: Date.now().toLocaleString(),
  },
  displayName: 'UserContext',
})
