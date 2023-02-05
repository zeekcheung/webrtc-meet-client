import { Form, Input, Space } from 'antd'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../components/layout'
import {
  createSignForm,
  formItemLayout,
  SignButton,
  SignParagraph,
  SignSpace,
  tailFormItemLayout,
} from '../../components/sign'
import { StyledTitle } from '../../components/typography'
import { SignInFormValue } from '../../types/form'
import { HOME_PATH, SIGN_UP_PATH } from '../../utils/constant'

const SignForm = createSignForm<SignInFormValue>()

export const SignIn = () => {
  const [form] = Form.useForm<SignInFormValue>()

  const handleFinish = (values: SignInFormValue) => {
    console.log('Received values of form: ', values)
  }

  return (
    <PageContainer>
      <SignSpace>
        <SignForm
          {...formItemLayout}
          form={form}
          name='sign-in'
          onFinish={handleFinish}
          style={{ minWidth: 400, maxWidth: 600 }}
          scrollToFirstError
        >
          <Form.Item {...tailFormItemLayout}>
            <StyledTitle>Sign in</StyledTitle>
          </Form.Item>

          <Form.Item
            name='username'
            label='Username'
            rules={[{ required: true, message: 'Please input your username!', whitespace: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='password'
            label='Password'
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <SignButton type='link' htmlType='submit'>
              Sign in
            </SignButton>
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Space direction='vertical'>
              <SignParagraph>
                Don&apos;t have an account?&nbsp;
                <Link to={SIGN_UP_PATH}>Sign up.</Link>
              </SignParagraph>
              <SignParagraph>
                Don&apos;t want to sign in?&nbsp;
                <Link to={HOME_PATH}>Return home.</Link>
              </SignParagraph>
            </Space>
          </Form.Item>
        </SignForm>
      </SignSpace>
    </PageContainer>
  )
}
