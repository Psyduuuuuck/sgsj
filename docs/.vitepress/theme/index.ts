import DefaultTheme from 'vitepress/theme'
import { h, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'
import './custom.css'

function isTextBlock(element: Element) {
  return ['P', 'UL', 'OL', 'TABLE', 'BLOCKQUOTE'].includes(element.tagName) &&
    (element.textContent || '').trim().length > 8
}

function isImageCue(element: Element) {
  const text = (element.textContent || '').trim()
  return /(如图|如下图|图示|下图|上图|界面|按钮|位置|点位|路线|地图|标记|框|箭头|所示|示意)/.test(text)
}

function distributeGuideImages() {
  if (typeof document === 'undefined') return

  const root = document.querySelector('.vp-doc')
  if (!root) return

  const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  if (!headings.length) return

  headings.forEach((heading) => {
    const level = Number(heading.tagName.slice(1))
    const sectionNodes: Element[] = []
    let node = heading.nextElementSibling

    while (node) {
      const isHeading = /^H[1-6]$/.test(node.tagName)
      const nodeLevel = isHeading ? Number(node.tagName.slice(1)) : 99
      if (isHeading && nodeLevel <= level) break
      sectionNodes.push(node)
      node = node.nextElementSibling
    }

    const figures = sectionNodes.filter((item) => item.classList.contains('image-flow'))
    if (!figures.length) return

    const textBlocks = sectionNodes.filter((item) => !item.classList.contains('image-flow') && isTextBlock(item))
    if (!textBlocks.length) return

    const cueBlocks = textBlocks.filter(isImageCue)
    const targets = cueBlocks.length ? cueBlocks : textBlocks

    figures.forEach((figure) => figure.remove())

    figures.forEach((figure, index) => {
      const targetIndex = Math.min(targets.length - 1, Math.floor((index * targets.length) / figures.length))
      const target = targets[targetIndex]
      figure.setAttribute('data-auto-placed', '1')
      figure.setAttribute('data-placement', cueBlocks.length ? 'text-cue' : 'text-flow')
      target.insertAdjacentElement('afterend', figure)
    })
  })
}

const ImageFlowEnhancer = {
  name: 'ImageFlowEnhancer',
  setup() {
    const route = useRoute()

    watch(
      () => route.path,
      () => {
        nextTick(() => {
          requestAnimationFrame(distributeGuideImages)
          window.setTimeout(distributeGuideImages, 350)
        })
      },
      { immediate: true }
    )

    return () => null
  }
}

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(ImageFlowEnhancer)
    })
  }
}
