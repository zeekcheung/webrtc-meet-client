import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 跨域请求时需要使用凭证
axios.defaults.withCredentials = true

/**
 * 封装请求函数，指定请求和响应的数据类型，并自动捕获请求异常
 * @param client 发送请求的 `Axios` 实例
 * @param config 请求配置
 * @returns 响应的 `data`
 */
export const request = async <RequestData, ResponseData>(
  client: AxiosInstance,
  config: AxiosRequestConfig<RequestData>,
) => {
  try {
    // 发送请求
    const response = await client.request<ResponseData, AxiosResponse<ResponseData, RequestData>, RequestData>(config)
    // 返回响应 data
    return response.data
  } catch (e: any) {
    // 捕获请求异常，抛出异常的响应 data
    throw e?.response?.data
  }
}
