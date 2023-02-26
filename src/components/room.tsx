import styled from '@emotion/styled'
import { Button, Space } from 'antd'
import { ReactNode } from 'react'
import { BaseContent, BaseHeader } from './layout'

export const RoomContainer = styled(Space)`
  height: 100%;
  background-color: #171c22;
  border-radius: 3rem;
  gap: 0 !important;

  @media (min-width: 400px) {
    display: grid;
    grid-template-columns: 16fr 7fr;

    & > .ant-space-item {
      height: 100%;
      border-top-right-radius: 3rem;
      border-bottom-right-radius: 3rem;
    }
  }

  @media (max-width: 400px) {
    display: flex;
    flex-direction: column;
    & > .ant-space-item:first-of-type {
      border-top-left-radius: 3rem;
      border-top-right-radius: 3rem;
    }
    & > .ant-space-item:last-of-type {
      flex: 1;
      width: 100%;
      border-bottom-left-radius: 3rem;
      border-bottom-right-radius: 3rem;
    }
  }

  & > .ant-space-item:last-child {
    background-color: #1f262e;
  }
`

export const MainContainer = styled(Space)`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 0 !important;

  @media (min-width: 400px) {
    & > .ant-space-item {
      padding: 1rem 3.25rem;
    }
    & > .ant-space-item:first-of-type {
      min-height: 6.4rem;
      background-color: #171c22;
      border-top-left-radius: 3rem;
    }

    & > .ant-space-item:last-child {
      flex: 1;
      background: linear-gradient(0, #242739, #15191e);
      border-bottom-left-radius: 3rem;
    }
  }
`

export const IconContainer = ({ children }: { children: ReactNode }) => {
  const size = 20

  const Container = styled(Space)`
    & svg {
      background-size: ${size}px;
      width: ${size}px;
      height: ${size}px;
      cursor: pointer;
    }
  `

  return <Container>{children}</Container>
}

export const StyledHeader = styled(BaseHeader)`
  width: 100%;
`

export const LayoutContainer = styled(Space)`
  gap: 0 !important;

  & svg {
    cursor: pointer;
  }
`

export const MainContentContainer = styled(BaseContent)`
  height: 100%;
  color: #7d8d9e;

  @media (min-width: 400px) {
    & > div:first-of-type {
      flex: 1;
    }

    & > div:last-child {
      margin-bottom: 1em;
    }
  }
`

export const RoomButton = styled(Button)`
  color: #7d8d9e !important;

  &:hover {
    color: #52b76e !important;
  }
`

export const SideContainer = styled(Space)`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 0 !important;

  & > .ant-space-item {
    padding: 1rem 3.25rem;
  }

  & > .ant-space-item:first-of-type {
    min-height: 6.4rem;
    border-bottom: 1px solid #15191e;
  }
`
