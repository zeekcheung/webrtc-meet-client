import { createContext } from '.'
import { Meeting } from '../types/meeting'

export const {
  context: MeetingContext,
  Provider: MeetingProvider,
  useValue: useMeeting,
} = createContext<Meeting | null>({
  defaultValue: null,
  displayName: 'MeetingContext',
  initialValue: null,
})
