import styled from '@emotion/styled'
import { Layout } from 'antd'

export const PageContainer = styled(Layout)`
  max-width: 131.25vh;
  height: 87.5vh;
  margin: 6.25vh auto;
  background-color: #191f24;
  color: #fff;
  border-radius: 2em;
  padding: 2em;
  display: flex;
  flex-direction: column;
`

export const BaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

export const BaseContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`

export const BaseFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`
