import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, '../src/resolver/index.ts'),
      name: 'name',
      fileName: (format) => {
        if (format === 'es') {
          return 'index.mjs'
        } else {
          return 'index.js'
        }
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: ['vue', 'vue-router', '@tarojs/taro'],
      output: {
        dir: path.resolve(__dirname, '../dist/resolver')
      }
    },
    emptyOutDir: false
  }
})
