import { Form } from 'antd'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../components/layout'
import {
  ConfirmFormItem,
  createSignForm,
  NicknameFormItem,
  PasswordFormItem,
  RedirectFormItem,
  SignParagraph,
  SignSpace,
  SubmitFormItem,
  TitleFormItem,
  UsernameFormItem,
} from '../../components/sign'
import { useAppDispatch } from '../../hooks'
import { registerThunk } from '../../store/slice/user-slice'
import { SignUpFormValue } from '../../types/form'
import { HOME_PATH, SIGN_IN_PATH } from '../../utils/constant'

const SignForm = createSignForm<SignUpFormValue>()

export const SignUp = () => {
  const [form] = Form.useForm<SignUpFormValue>()
  const dispatch = useAppDispatch()

  const handleFinish = (values: SignUpFormValue) => {
    void dispatch(registerThunk(values))
    form.resetFields()
  }

  return (
    <PageContainer>
      <SignSpace>
        <SignForm
          form={form}
          name='sign-up'
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onFinish={handleFinish}
          style={{ minWidth: '33rem', maxWidth: '100%' }}
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
