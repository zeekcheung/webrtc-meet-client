/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import validator from 'validator'
import { IValidateResult, ValidateResult } from '.'

/**
 * 校验用户名 `username` 是否合法
 * @param username 用户名
 * @returns 表单校验结果
 */
export const validateUsername = (username: string): IValidateResult => {
  // 长度必须在[4, 12]之间
  if (!validator.isLength(username, { min: 4, max: 12 })) {
    return ValidateResult('error', 'The length of username must fall in [4, 12]!')
  }
  // 必须由英文字母或数字组成
  if (!validator.isAlphanumeric(username)) {
    return ValidateResult('error', 'username must contains only letters and numbers (a-zA-Z0-9)!')
  }
  return ValidateResult()
}

/**
 * 校验昵称 `nickname` 是否合法
 * @param nickname 昵称
 * @returns 表单校验结果
 */
export const validateNickname = (nickname: string): IValidateResult => {
  return validateUsername(nickname)
}

/**
 * 校验密码 `password` 是否合法
 * @param password 密码
 * @returns 表单校验结果
 */
export const validatePassword = (password: string): IValidateResult => {
  // 最少包含3个数字
  // 最少包含1个符号
  // 最少包含2个小写英文字母
  // 最少包含2个大写英文字符
  if (
    !validator.isStrongPassword(password, {
      minNumbers: 3,
      minSymbols: 1,
      minLowercase: 2,
      minUppercase: 2,
    })
  ) {
    return ValidateResult('error', `The password is't strong enough!`)
  }
  return ValidateResult()
}
