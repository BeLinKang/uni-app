import '@dcloudio/uni-components/style/text.css'
import { DecodeOptions, parseText } from '@dcloudio/uni-components'
import { UniElement } from './UniElement'
import { UniNodeJSON } from '@dcloudio/uni-shared'

interface TextProps {
  space: DecodeOptions['space']
  decode: boolean
}

const PROP_NAMES_HOVER = ['space', 'decode']

export class UniTextElement extends UniElement<TextProps> {
  private _text: string = ''

  constructor(
    id: number,
    parentNodeId: number,
    refNodeId: number,
    nodeJson: Partial<UniNodeJSON>
  ) {
    super(
      id,
      document.createElement('uni-text'),
      parentNodeId,
      refNodeId,
      nodeJson,
      PROP_NAMES_HOVER
    )
  }

  init(nodeJson: Partial<UniNodeJSON>) {
    this._text = nodeJson.t || ''
    super.init(nodeJson)
  }

  setText(text: string) {
    this._text = text
    this.update()
  }

  update() {
    const {
      $props: { space, decode },
    } = this
    this.$.innerHTML = parseText(this._text, {
      space,
      decode,
    }).join('<br>')
  }
}