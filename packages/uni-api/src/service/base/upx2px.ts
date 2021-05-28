import { getBaseSystemInfo } from '@dcloudio/uni-platform'
import { defineSyncApi } from '../../helpers/api'
import {
  API_TYPE_UPX2PX,
  API_UPX2PX,
  Upx2pxProtocol,
} from '../../protocols/base/upx2px'

const EPS = 1e-4
const BASE_DEVICE_WIDTH = 750
let isIOS = false
let deviceWidth = 0
let deviceDPR = 0

function checkDeviceWidth() {
  const { platform, pixelRatio, windowWidth } = getBaseSystemInfo()
  deviceWidth = windowWidth as number
  deviceDPR = pixelRatio as number
  isIOS = platform === 'ios'
}

function checkValue(value: unknown, defaultValue: number) {
  const newValue = Number(value) as number
  return isNaN(newValue) ? defaultValue : newValue
}

export const upx2px = defineSyncApi<API_TYPE_UPX2PX>(
  API_UPX2PX,
  (number, newDeviceWidth?: number) => {
    // ssr nodejs 中，暂不支持 rpx,upx 转 px
    if (__NODE_JS__) {
      return number
    }
    if (deviceWidth === 0) {
      checkDeviceWidth()
    }

    number = Number(number)
    if (number === 0) {
      return 0
    }
    let width = newDeviceWidth || deviceWidth
    if (__PLATFORM__ === 'app' || __PLATFORM__ === 'h5') {
      const config = __uniConfig.globalStyle || {}
      // ignore rpxCalcIncludeWidth
      const maxWidth = checkValue(config.rpxCalcMaxDeviceWidth, 960)
      const baseWidth = checkValue(config.rpxCalcBaseDeviceWidth, 375)
      width = width <= maxWidth ? width : baseWidth
    }
    let result = (number / BASE_DEVICE_WIDTH) * width
    if (result < 0) {
      result = -result
    }
    result = Math.floor(result + EPS)
    if (result === 0) {
      if (deviceDPR === 1 || !isIOS) {
        result = 1
      } else {
        result = 0.5
      }
    }
    return number < 0 ? -result : result
  },
  Upx2pxProtocol
)
