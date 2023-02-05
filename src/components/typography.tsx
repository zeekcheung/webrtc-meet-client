/* eslint-disable @typescript-eslint/restrict-plus-operands */
import styled from '@emotion/styled'
import { Divider, Typography } from 'antd'

const { Title, Paragraph } = Typography

export const StyledTitle = styled(Title)`
  margin: 0.25em !important;
  color: #fff !important;
  text-align: center;
  & span {
    color: skyblue !important;
  }
`

export const StyledParagraph = styled(Paragraph)`
  margin: 2em;
  color: #fff;
  text-align: center;
`

export const StyledDivider = styled(Divider)`
  margin: 0.2rem;
`
