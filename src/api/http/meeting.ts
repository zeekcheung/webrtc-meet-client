import axios from 'axios'
import { request } from '.'
import { CreateMeetingDto, Meeting } from '../../types/meeting'
import { MEETING_BASE_URL } from '../../utils/constant'

const meetingClient = axios.create({
  baseURL: `${MEETING_BASE_URL}`,
})

export const createMeeting = async (createMeetingDto: CreateMeetingDto) => {
  return await request<CreateMeetingDto, Meeting>(meetingClient, {
    method: 'POST',
    data: createMeetingDto,
  })
}
