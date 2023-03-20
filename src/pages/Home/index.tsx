import { PageContainer } from '../../components/layout'
import { HomeFooter } from './footer'
import { HomeHeader } from './header'
import { HomeMain } from './main'

const Home = () => {
  return (
    <PageContainer>
      <HomeHeader />
      <HomeMain />
      <HomeFooter />
    </PageContainer>
  )
}

export default Home
