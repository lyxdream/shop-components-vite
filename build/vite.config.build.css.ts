import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    minify: true, // 压缩
    lib: {
      entry: path.resolve(__dirname, '../dist/styles/themes/default.scss'),
      formats: ['es'],
      name: 'style',
      fileName: 'style'
    },
    emptyOutDir: false
  }
})
