import { createContext as reactCreateContext, ReactNode, useContext } from 'react'

export const createContext = function <V>({
  defaultValue,
  displayName,
  initialValue,
}: {
  defaultValue: V
  displayName?: string
  initialValue: V
}) {
  const context = reactCreateContext<{
    // 读取context值
    value: V
    // 更新context值（闭包，注意需要作为方法调用）
    setValue: (newValue: V) => void
  }>({
    value: defaultValue,
    setValue(newValue) {
      this.value = newValue
    },
  })
  context.displayName = displayName

  const Provider = ({ children }: { children: ReactNode }) => {
    return (
      <context.Provider
        value={{
          value: initialValue,
          setValue(newValue) {
            this.value = newValue
          },
        }}
      >
        {children}
      </context.Provider>
    )
  }

  const useValue = () => {
    const value = useContext(context)
    return value
  }

  return { context, Provider, useValue }
}
