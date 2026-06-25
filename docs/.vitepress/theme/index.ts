import DefaultTheme from 'vitepress/theme'
import { h, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'
import './custom.css'

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

    const figures = sectionNodes.filter((item) => {
      return item.classList.contains('image-flow') && item.getAttribute('data-auto-placed') !== '1'
    })

    if (!figures.length) return

    const candidates = sectionNodes.filter((item) => {
      if (item.classList.contains('image-flow')) return false
      if (item.closest('figure')) return false
      if (!['P', 'UL', 'OL', 'TABLE', 'BLOCKQUOTE'].includes(item.tagName)) return false
      return (item.textContent || '').trim().length > 8
    })

    if (!candidates.length) return

    figures.forEach((figure) => figure.remove())

    figures.forEach((figure, index) => {
      const targetIndex = Math.min(
        candidates.length - 1,
        Math.floor(((index + 0.55) * candidates.length) / figures.length)
      )
      const target = candidates[targetIndex]
      figure.setAttribute('data-auto-placed', '1')
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
