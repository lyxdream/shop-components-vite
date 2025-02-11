import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import configPkg from '../src/config.json'

const input = {}

configPkg.nav.map((item) => {
  item.packages.forEach((element) => {
    // const { name, setup, funcCall } = element
    // const suffix = funcCall === true || setup === true ? '.ts' : '.vue'
    // input[name] = path.resolve(__dirname, `../src/packages/${name.toLowerCase()}/index${suffix}`)
    const { name } = element
    input[name] = path.resolve(__dirname, `../src/packages/${name.toLowerCase()}/index.ts`)
  })
})

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, '../src')
      }
    ]
  },
  plugins: [
    // 默认情况下，Vue会对未知标签发出警告，并且不会编译它们的内容。
    // isCustomElement 可以指定某些标签为自定义元素，从而避免这些警告并正确处理这些标签。
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            return (
              tag.startsWith('taro-')
              || tag.startsWith('scroll-view')
              || tag.startsWith('swiper')
              || tag.startsWith('swiper-item')
              || tag.startsWith('picker')
              || tag.startsWith('picker-view')
              || tag.startsWith('picker-view-column')
            )
          },
          whitespace: 'preserve' // 保留所有空白字符
        }
      }
    })

  ],
  build: {
    minify: false, // Taro 相关的构建不能开启，开启后会导致找不到模板  确保生成的代码不会被压缩，避免潜在的问题。
    target: 'es2015',
    lib: {
      entry: '',
      name: 'index',
      formats: ['es']
    },
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: ['vue', 'vue-router', '@tarojs/taro'],
      input,
      output: {
        dir: path.resolve(__dirname, '../dist/packages'),
        entryFileNames: chunkInfo => `${chunkInfo.name.toLowerCase()}/${chunkInfo.name}.js`,
        plugins: []
      }
    },
    emptyOutDir: false
  }
})
