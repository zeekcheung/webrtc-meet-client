import { createContext } from '.'
import { Meeting } from '../types/form'

export const {
  context: MeetingContext,
  Provider: MeetingProvider,
  useValue: useMeeting,
} = createContext<Meeting | null>({
  defaultValue: null,
  displayName: 'MeetingContext',
  initialValue: {
    name: 'meeting a',
    size: 1,
    password: '',
    beginTime: '',
    endTime: '',
  },
})
