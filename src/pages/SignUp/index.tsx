import { Form } from 'antd'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../components/layout'
import {
  ConfirmFormItem,
  createSignForm,
  formItemLayout,
  NicknameFormItem,
  PasswordFormItem,
  RedirectFormItem,
  SignParagraph,
  SignSpace,
  SubmitFormItem,
  TitleFormItem,
  UsernameFormItem,
} from '../../components/sign'
import { SignUpFormValue } from '../../types/form'
import { HOME_PATH, SIGN_IN_PATH } from '../../utils/constant'

const SignForm = createSignForm<SignUpFormValue>()

export const SignUp = () => {
  const [form] = Form.useForm<SignUpFormValue>()

  const handleFinish = (values: SignUpFormValue) => {
    // TODO 注册
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
          style={{ minWidth: 500, maxWidth: 600 }}
          scrollToFirstError
        >
          <TitleFormItem title='Sign up' />

          <UsernameFormItem />

          <NicknameFormItem />

          <PasswordFormItem />

          <ConfirmFormItem />

          <SubmitFormItem content='Sign up' />

          <RedirectFormItem>
            <SignParagraph>
              Already have an account?&nbsp;
              <Link to={SIGN_IN_PATH}>Sign in.</Link>
            </SignParagraph>
            <SignParagraph>
              Don&apos;t want to sign up?&nbsp;
              <Link to={HOME_PATH}>Return home.</Link>
            </SignParagraph>
          </RedirectFormItem>
        </SignForm>
      </SignSpace>
    </PageContainer>
  )
}
