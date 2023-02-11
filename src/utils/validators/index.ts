import { ValidateStatus } from 'antd/es/form/FormItem'

type ErrorMsg = string | null

/**
 * 表单校验结果
 */
export interface IValidateResult {
  validateStatus: ValidateStatus
  errorMsg: ErrorMsg
}

/**
 * 表单校验结果的工厂函数
 * @param validateStatus 校验状态
 * @param errorMsg 错误信息
 * @returns 表单校验结果
 */
export function ValidateResult(validateStatus: ValidateStatus = 'success', errorMsg: ErrorMsg = null): IValidateResult {
  return {
    validateStatus,
    errorMsg,
  }
}
