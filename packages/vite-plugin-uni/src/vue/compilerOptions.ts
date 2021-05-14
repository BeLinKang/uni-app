import { extend, isArray } from '@vue/shared'
import { CompilerOptions, SFCTemplateCompileOptions } from '@vue/compiler-sfc'

import { isNativeTag } from '@dcloudio/uni-shared'
import { EXTNAME_VUE_RE, parseCompatConfigOnce } from '@dcloudio/uni-cli-shared'

import { block } from './transforms/block'
import { matchMedia } from './transforms/matchMedia'
import { VitePluginUniResolvedOptions } from '..'

export const uniVueCompilerOptions: CompilerOptions = {
  isNativeTag,
  nodeTransforms: [block, matchMedia],
}

export const uniVueTransformAssetUrls: SFCTemplateCompileOptions['transformAssetUrls'] =
  {
    tags: {
      audio: ['src'],
      video: ['src', 'poster'],
      img: ['src'],
      image: ['src'],
      'cover-image': ['src'],
      // h5
      'v-uni-audio': ['src'],
      'v-uni-video': ['src', 'poster'],
      'v-uni-image': ['src'],
      'v-uni-cover-image': ['src'],
      // nvue
      'u-image': ['src'],
      'u-video': ['src', 'poster'],
    },
  }

export const uniVueTemplateOptions: Partial<SFCTemplateCompileOptions> = {
  compilerOptions: uniVueCompilerOptions,
  transformAssetUrls: uniVueTransformAssetUrls,
}

export function initPluginVueOptions(options: VitePluginUniResolvedOptions) {
  const vueOptions = options.vueOptions || (options.vueOptions = {})
  if (!vueOptions.include) {
    vueOptions.include = []
  }
  if (!isArray(vueOptions.include)) {
    vueOptions.include = [vueOptions.include]
  }
  vueOptions.include.push(EXTNAME_VUE_RE)

  const templateOptions = vueOptions.template || (vueOptions.template = {})

  templateOptions.transformAssetUrls = uniVueTransformAssetUrls

  const compilerOptions =
    templateOptions.compilerOptions || (templateOptions.compilerOptions = {})
  compilerOptions.isNativeTag = isNativeTag
  if (!compilerOptions.nodeTransforms) {
    compilerOptions.nodeTransforms = []
  }

  const compatConfig = parseCompatConfigOnce(options.inputDir)

  compilerOptions.compatConfig = extend(
    compilerOptions.compatConfig || {},
    compatConfig
  )

  compilerOptions.nodeTransforms.unshift(matchMedia)
  compilerOptions.nodeTransforms.unshift(block)
  return vueOptions
}