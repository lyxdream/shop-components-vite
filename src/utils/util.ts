export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string => objectToString.call(value)

export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}
export const isArray = Array.isArray
export const isMap = (val: unknown): val is Map<any, any> => toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<any> => toTypeString(val) === '[object Set]'

export const isDate = (val: unknown): val is Date => val instanceof Date
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

export const win = window

export const docu = document

export const body = docu.body

export const getPropByPath = (obj: any, keyPath: string) => {
  try {
    return keyPath.split('.').reduce((prev, curr) => prev[curr], obj)
  } catch (error) {
    return ''
  }
}

export const deepMerge = (target: any, newObj: any) => {
  Object.keys(newObj).forEach((key) => {
    const targetValue = target[key]
    const newObjValue = newObj[key]
    if (isObject(targetValue) && isObject(newObjValue)) {
      deepMerge(targetValue, newObjValue)
    } else {
      target[key] = newObjValue
    }
  })
  return target
}

export function preventDefault(event: Event, isStopPropagation?: boolean) {
  if (typeof event.cancelable !== 'boolean' || event.cancelable) {
    event.preventDefault()
  }

  if (isStopPropagation) {
    event.stopPropagation()
  }
}

export const padZero = (num: number | string, length = 2): string => {
  num += ''
  while ((num as string).length < length) {
    num = '0' + num
  }
  return num.toString()
}

export const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max)

export const getScrollTopRoot = (): number => {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
}
