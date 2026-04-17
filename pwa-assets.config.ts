import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    ...minimal2023Preset,
    png: {
      compressionLevel: 9,
      quality: 100,
      palette: false
    },
    transparent: {
      ...minimal2023Preset.transparent,
      resizeOptions: {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        fit: 'contain'
      }
    },
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: {
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        fit: 'contain'
      }
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: {
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        fit: 'contain'
      }
    }
  },
  images: ['public/images/launcher_icons/launcher_icons/ic_launcher_play.png']
})
