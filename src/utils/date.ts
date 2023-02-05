import dayjs from 'dayjs'
import localData from 'dayjs/plugin/localeData'
import updateLocale from 'dayjs/plugin/updateLocale'
import { useEffect, useState } from 'react'
;(function configDayjs() {
  // 配置 dayjs
  dayjs.extend(updateLocale)
  dayjs.updateLocale('en', {
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  })
  dayjs.extend(localData)
})()

/**
 * 每隔`ms`毫秒获取一次当前的`Date`对象
 * @param ms 间隔的毫秒数，默认为 60 * 1000
 * @returns {Date} 当前的`Date`对象
 */
export const useCurrDate = (ms = 60 * 1000): Date => {
  const [currDate, setCurrDate] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrDate(new Date())
    }, ms)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return currDate
}

/**
 * 解析`Date`实例对象，获取年月日等时间数据
 * @param date `Date`实例对象
 * @returns 时间数据
 */
export const getTimeFromDate = (date: Date) => {
  const _date = dayjs(date)
  const hour = _date.hour()
  const minute = _date.minute()
  const second = _date.second()
  const weekday = dayjs.weekdaysShort()[_date.day()]
  const day = _date.date()
  const month = dayjs.monthsShort()[_date.month()]
  const year = _date.year()

  return { hour, minute, second, weekday, day, month, year }
}
