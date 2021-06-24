import { extend } from '@vue/shared'
interface PlusResult extends Record<string, any> {
  code?: number
  message?: string
}

type PlusError = PlusResult
type Resolve = (res: any) => void
type Reject = (errMsg: string, errRes?: any) => void

export function warpPlusSuccessCallback(
  resolve: Resolve,
  after?: (res: any) => any
) {
  return function successCallback(data: PlusResult) {
    delete data.code
    delete data.message
    if (typeof after === 'function') {
      data = after(data)
    }
    resolve(data)
  }
}

export function warpPlusErrorCallback(reject: Reject, errMsg?: string) {
  return function errorCallback(error?: PlusError) {
    error = error || {}
    // 一键登录errorCallback新增 appid、metadata、uid 参数返回
    errMsg = error.message || errMsg || ''
    delete error.message
    reject(errMsg, extend({ code: 0 }, error))
  }
}

export function warpPlusEvent(plusObject: () => any, event: string) {
  return function () {
    const object = plusObject()
    object(function (data?: Record<string, any>) {
      if (data) {
        delete data.code
        delete data.message
      }
      UniServiceJSBridge.invokeOnCallback(event, data)
    })
  }
}

export function warpPlusMethod(
  plusObject: () => any,
  before?: (options: any) => any,
  after?: (res: any) => any
) {
  return function (
    options: any,
    { resolve, reject }: { resolve: Resolve; reject: Reject }
  ) {
    const object = plusObject()
    object(
      extend({}, typeof before === 'function' ? before(options) : options, {
        success: warpPlusSuccessCallback(resolve, after),
        fail: warpPlusErrorCallback(reject),
      })
    )
  }
}