import { PageContainer } from '../../components/layout'
import { useAuthenticate, useUser } from '../../hooks'
import { User } from '../../types/user'

// TODO 实现用户信息展示页
const Profile = () => {
  useAuthenticate()

  const user = useUser() as User
  console.log(user)

  return <PageContainer>Profile</PageContainer>
}

export default Profile
