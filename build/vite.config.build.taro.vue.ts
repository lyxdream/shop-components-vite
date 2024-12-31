import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  define: {
    'process.env.TARO_ENV': 'process.env.TARO_ENV'
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, '../src')
      }
    ]
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            return (
              tag.startsWith('taro-')
              || tag.startsWith('scroll-view')
              || tag.startsWith('swiper')
              || tag.startsWith('swiper-item')
              || tag.startsWith('scroll-view')
              || tag.startsWith('picker')
              || tag.startsWith('picker-view')
              || tag.startsWith('picker-view-column')
            )
          },
          whitespace: 'preserve'
        }
      }
    })
  ],
  build: {
    minify: false,
    target: 'es2015',
    rollupOptions: {
      // 请确保外部化库中不需要的依赖
      external: ['vue', 'vue-router', '@tarojs/taro'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          '@tarojs/taro': 'Taro'
        },
        plugins: [],
        exports: 'named' // 导出命名导出
      }
    },
    lib: {
      entry: path.resolve(__dirname, '../src/taro.build.ts'),
      name: 'cq-shop-components',
      fileName: () => 'cq-shop-components.umd.js',
      formats: ['umd']
    }
  }
})
