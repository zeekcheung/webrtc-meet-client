/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/promise-function-async */
import styled from '@emotion/styled'
import { Form, Input, Space } from 'antd'
import Paragraph from 'antd/es/typography/Paragraph'
import { ReactNode } from 'react'
import { SignInFormValue, SignUpFormValue } from '../types/form'
import { validateNickname, validatePassword, validateUsername } from '../utils/validators/user'
import { StyledButton } from './lib'
import { StyledTitle } from './typography'

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

export const TitleFormItem = ({ title }: { title: string }) => {
  return (
    <Form.Item {...tailFormItemLayout}>
      <StyledTitle>{title}</StyledTitle>
    </Form.Item>
  )
}

export const UsernameFormItem = () => {
  return (
    <Form.Item
      name='username'
      label='Username'
      tooltip="Username is unique and can't be changed again!"
      rules={[
        {
          required: true,
          message: 'Please input your username!',
          whitespace: true,
        },
        // 添加自定义校验规则
        () => ({
          validator(_, value: SignUpFormValue['username']) {
            const { errorMsg } = validateUsername(value)
            return errorMsg === null ? Promise.resolve() : Promise.reject(errorMsg)
          },
        }),
      ]}
    >
      <Input />
    </Form.Item>
  )
}

export const NicknameFormItem = () => {
  return (
    <Form.Item
      name='nickname'
      label='Nickname'
      tooltip='What do you want others to call you?'
      rules={[
        {
          required: true,
          message: 'Please input your nickname!',
          whitespace: true,
        },
        // 添加自定义校验规则
        () => ({
          validator(_, value: SignUpFormValue['nickname']) {
            const { errorMsg } = validateNickname(value)
            return errorMsg === null ? Promise.resolve() : Promise.reject(errorMsg)
          },
        }),
      ]}
    >
      <Input />
    </Form.Item>
  )
}

export const PasswordFormItem = () => {
  return (
    <Form.Item
      name='password'
      label='Password'
      tooltip='Password must contains at least 3 number, 1 symbol, 2 lowercase and 2 uppercase!'
      rules={[
        {
          required: true,
          message: 'Please input your password!',
        },
        // 添加自定义校验规则
        () => ({
          validator(_, value: SignUpFormValue['password']) {
            const { errorMsg } = validatePassword(value)
            return errorMsg === null ? Promise.resolve() : Promise.reject(errorMsg)
          },
        }),
      ]}
      hasFeedback
    >
      <Input.Password />
    </Form.Item>
  )
}

export const ConfirmFormItem = () => {
  return (
    <Form.Item
      name='confirm'
      label='Confirm Password'
      dependencies={['password']}
      hasFeedback
      rules={[
        {
          required: true,
          message: 'Please confirm your password!',
        },
        ({ getFieldValue }) => ({
          validator(_, value: SignUpFormValue['confirm']) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve()
            }
            return Promise.reject(new Error('The two passwords that you entered do not match!'))
          },
        }),
      ]}
    >
      <Input.Password />
    </Form.Item>
  )
}

export const SubmitFormItem = ({ content }: { content: string }) => {
  return (
    <Form.Item {...tailFormItemLayout}>
      <SignButton type='link' htmlType='submit'>
        {content}
      </SignButton>
    </Form.Item>
  )
}

export const RedirectFormItem = ({ children }: { children: ReactNode }) => {
  return (
    <Form.Item {...tailFormItemLayout}>
      <Space direction='vertical'>{children}</Space>
    </Form.Item>
  )
}
