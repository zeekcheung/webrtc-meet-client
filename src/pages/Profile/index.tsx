import { PageContainer } from '../../components/layout'
import { useAppSelector } from '../../hooks'
import { userSelector } from '../../store/slice/user-slice'

// TODO 实现用户信息展示页
export const Profile = () => {
  const user = useAppSelector(userSelector)
  console.log(user)
  return <PageContainer>Profile</PageContainer>
}
