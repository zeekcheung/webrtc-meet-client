import styled from '@emotion/styled'
import { Space, Typography } from 'antd'
import { PageContainer } from '../../components/layout'
import { StyledButton, StyledLink } from '../../components/lib'
import { StyledParagraph, StyledTitle } from '../../components/typography'
import { HOME_PATH } from '../../utils/constant'

export const NotFound = () => {
  return (
    <PageContainer>
      <StyledSpace>
        <Typography>
          <StyledTitle>404 - Looks like you&apos;re lost.</StyledTitle>
          <StyledParagraph>
            Maybe this page used to exist or you just spelled something wrong.
            <br /> Chances are you spelled something wrong, so can you double check the URL?
          </StyledParagraph>
        </Typography>

        <StyledLink to={HOME_PATH}>
          <StyledButton type='link'>Return Home</StyledButton>
        </StyledLink>
      </StyledSpace>
    </PageContainer>
  )
}

const StyledSpace = styled(Space)`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 5em;
`
