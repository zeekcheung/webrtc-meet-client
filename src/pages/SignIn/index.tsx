/* eslint-disable @typescript-eslint/no-floating-promises */
import { Form } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
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
import { useAppDispatch } from '../../hooks'
import { thunkIsFulfilled } from '../../store'
import { loginThunk } from '../../store/slice/user-slice'
import { SignInFormValue } from '../../types/form'
import { HOME_PATH, SIGN_UP_PATH } from '../../utils/constant'

const SignForm = createSignForm<SignInFormValue>()

export const SignIn = () => {
  const [form] = Form.useForm<SignInFormValue>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleFinish = async (values: SignInFormValue) => {
    const res = await dispatch(loginThunk(values))
    // 登录成功则跳转到主页
    if (thunkIsFulfilled(res)) {
      navigate(HOME_PATH)
    }
  }

  return (
    <PageContainer>
      <SignSpace>
        <SignForm
          {...formItemLayout}
          form={form}
          name='sign-in'
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
