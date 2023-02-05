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
import { SignUpFormValue } from '../../types/form'
import { HOME_PATH, SIGN_IN_PATH } from '../../utils/constant'

const SignForm = createSignForm<SignUpFormValue>()

export const SignUp = () => {
  const [form] = Form.useForm<SignUpFormValue>()

  const handleFinish = (values: SignUpFormValue) => {
    console.log('Received values of form: ', values)
  }

  return (
    <PageContainer>
      <SignSpace>
        <SignForm
          {...formItemLayout}
          form={form}
          name='sign-up'
          onFinish={handleFinish}
          style={{ minWidth: 400, maxWidth: 600 }}
          scrollToFirstError
        >
          <Form.Item {...tailFormItemLayout}>
            <StyledTitle>Sign up</StyledTitle>
          </Form.Item>

          <Form.Item
            name='username'
            label='Username'
            tooltip="Username is unique and can't be changed again!"
            rules={[{ required: true, message: 'Please input your username!', whitespace: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='nickname'
            label='Nickname'
            tooltip='What do you want others to call you?'
            rules={[{ required: true, message: 'Please input your nickname!', whitespace: true }]}
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
                // eslint-disable-next-line @typescript-eslint/promise-function-async
                validator(_, value: SignUpFormValue['confirm']) {
                  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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

          <Form.Item {...tailFormItemLayout}>
            <SignButton type='link' htmlType='submit'>
              Sign up
            </SignButton>
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Space direction='vertical'>
              <SignParagraph>
                Already have an account?&nbsp;
                <Link to={SIGN_IN_PATH}>Sign in.</Link>
              </SignParagraph>
              <SignParagraph>
                Don&apos;t want to sign up?&nbsp;
                <Link to={HOME_PATH}>Return home.</Link>
              </SignParagraph>
            </Space>
          </Form.Item>
        </SignForm>
      </SignSpace>
    </PageContainer>
  )
}
