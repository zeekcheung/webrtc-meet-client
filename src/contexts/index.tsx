import { createContext as reactCreateContext, ReactNode, useContext } from 'react'

export const createContext = function <V>({
  defaultValue,
  displayName,
  initialValue,
  errorMessage,
}: {
  defaultValue: V
  displayName?: string
  initialValue: V
  errorMessage: string
}) {
  const context = reactCreateContext<V>(defaultValue)
  context.displayName = displayName

  const Provider = ({ children }: { children: ReactNode }) => {
    return <context.Provider value={initialValue}>{children}</context.Provider>
  }

  // 读取context值
  const useValue = () => {
    const value = useContext(context)
    if (value === null) {
      throw new Error(errorMessage)
    }
    return value
  }

  // 更新context值（闭包）
  const setValue = (newValue: V) => (initialValue = newValue)

  return { context, Provider, useValue, setValue }
}
