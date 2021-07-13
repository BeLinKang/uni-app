import { hasOwn } from '@vue/shared'
import { Component, ComponentInternalInstance, createApp, reactive } from 'vue'
import { decodeAttr, parseEventName, UniNodeJSON } from '@dcloudio/uni-shared'
import { UniNode } from '../elements/UniNode'
import { createInvoker } from '../modules/events'
import { createWrapper, UniCustomElement } from '.'
import { $ } from '../page'

export class UniComponent extends UniNode {
  declare $: UniCustomElement
  private $props!: Record<string, any>
  private $holder?: Element
  constructor(
    id: number,
    tag: string,
    component: Component,
    parentNodeId: number,
    nodeJson: Partial<UniNodeJSON>,
    selector?: string
  ) {
    super(id, tag, parentNodeId)
    const container = document.createElement('div')
    ;(container as any).__vueParent = getVueParent(this)
    this.$props = reactive({})
    this.init(nodeJson)
    createApp(createWrapper(component, this.$props)).mount(container)
    this.$ = container.firstElementChild! as UniCustomElement
    if (selector) {
      this.$holder = this.$.querySelector(selector)!
    }
    if (hasOwn(nodeJson, 't')) {
      this.setText(nodeJson.t || '')
    }
  }
  init(nodeJson: Partial<UniNodeJSON>) {
    const { a } = nodeJson
    if (a) {
      Object.keys(a).forEach((n) => {
        this.setAttr(n, a[n])
      })
    }
  }
  setText(text: string) {
    ;(this.$holder || this.$).textContent = text
  }
  setAttr(name: string, value: unknown) {
    const decoded = decodeAttr(name)
    if (name.indexOf('.e') === 0) {
      this.$props[decoded] = createInvoker(
        this.id,
        value as number,
        parseEventName(decoded)[1]
      )
    } else {
      this.$props[decoded] = value
    }
  }
  removeAttr(name: string) {
    this.$props[decodeAttr(name)] = null
  }
  appendChild(node: Element) {
    return (this.$holder || this.$).appendChild(node)
  }
  insertBefore(newChild: Node, refChild: Node) {
    return (this.$holder || this.$).insertBefore(newChild, refChild)
  }
}

function getVueParent(node: UniNode): ComponentInternalInstance | null {
  while (node && node.pid > 0) {
    node = $(node.pid)
    if (node) {
      const { __vueParentComponent } = node.$ as unknown as {
        __vueParentComponent: ComponentInternalInstance
      }
      if (__vueParentComponent) {
        return __vueParentComponent
      }
    }
  }
  return null
}
