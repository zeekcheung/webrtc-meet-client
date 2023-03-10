import { Typography } from 'antd'
import { useRouteError } from 'react-router-dom'
import { PageContainer } from '../../components/layout'
import { StyledParagraph, StyledTitle } from '../../components/typography'

export const ErrorPage = () => {
  const error: any = useRouteError()

  return (
    <PageContainer>
      <Typography>
        <StyledTitle>Oops!</StyledTitle>
        <StyledParagraph>Sorry, an unexpected error has occurred.</StyledParagraph>
        <StyledParagraph type='danger'>{Boolean(error.statusText) || error.message}</StyledParagraph>
      </Typography>
    </PageContainer>
  )
}
