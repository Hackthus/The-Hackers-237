import { inBrowser } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'

export default {
  ...DefaultTheme,
  setup() {
    if (inBrowser) {

      // ------------------------------------------------------------
      // BARRE DE PROGRESSION DE LECTURE
      // ------------------------------------------------------------
      const bar = document.createElement('div')
      bar.className = 'reading-progress'
      document.body.appendChild(bar)

      const updateProgress = () => {
        const scrollTop = window.scrollY
        const docHeight = document.body.scrollHeight - window.innerHeight
        const progress = docHeight > 0
          ? Math.min((scrollTop / docHeight) * 100, 100)
          : 0
        bar.style.width = `${progress}%`
      }

      window.addEventListener('scroll', updateProgress, { passive: true })
      window.addEventListener('resize', updateProgress, { passive: true })

    }
  }
}