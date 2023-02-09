import { Form } from 'antd'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../components/layout'
import {
  createSignForm,
  formItemLayout,
  PasswordFormItem,
  RedirectFormItem,
  SignParagraph,
  SignSpace,
  SubmitFormItem,
  TitleFormItem,
  UsernameFormItem,
} from '../../components/sign'
import { SignInFormValue } from '../../types/form'
import { HOME_PATH, SIGN_UP_PATH } from '../../utils/constant'

const SignForm = createSignForm<SignInFormValue>()

export const SignIn = () => {
  const [form] = Form.useForm<SignInFormValue>()

  const handleFinish = (values: SignInFormValue) => {
    // TODO 登录
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
          style={{ minWidth: 500, maxWidth: 600 }}
          scrollToFirstError
        >
          <TitleFormItem title='Sign in' />

          <UsernameFormItem />

          <PasswordFormItem />

          <SubmitFormItem content='Sign in' />

          <RedirectFormItem>
            <SignParagraph>
              Don&apos;t have an account?&nbsp;
              <Link to={SIGN_UP_PATH}>Sign up.</Link>
            </SignParagraph>
            <SignParagraph>
              Don&apos;t want to sign in?&nbsp;
              <Link to={HOME_PATH}>Return home.</Link>
            </SignParagraph>
          </RedirectFormItem>
        </SignForm>
      </SignSpace>
    </PageContainer>
  )
}
