import styled from '@emotion/styled'
import { Form, Space } from 'antd'
import Paragraph from 'antd/es/typography/Paragraph'
import { SignInFormValue, SignUpFormValue } from '../types/form'
import { StyledButton } from './lib'

export const SignSpace = styled(Space)`
  flex-direction: column;
  justify-content: center;
`

export const SignButton = styled(StyledButton)`
  flex: auto;
  box-sizing: content-box;
  padding: 0.1em;
`

export const SignParagraph = styled(Paragraph)`
  margin: 0;
  color: #737377;
  font-weight: 500;

  & a {
    color: #69b1ff;
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      color: #fff;
      font-weight: 500;
      text-decoration: underline;
    }
  }
`

/**
 * 创建一个用于注册/登录页面的表单组件
 */
export const createSignForm = function <FormValue extends SignUpFormValue | SignInFormValue>() {
  return styled(Form<FormValue>)`
    transform: translateX(-16.7%);

    & span,
    & label {
      color: #fff !important;
    }

    & .ant-form-item-control-input-content {
      display: flex;
      justify-content: center;
    }
  `
}

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
}

export const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
}
