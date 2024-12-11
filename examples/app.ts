import { createApp } from 'vue'
import './app.scss'

import '../dist/style.css'
// import CqShopComponents from '@/taro.dev'
import { CqButton } from '@/taro.dev'
// import CqShopComponents from '../dist/cq-shop-components.es.js'
// import { CqButton } from '../dist/packages/button/index.mjs'
const App = createApp({
  onShow() {
    console.log('App onShow.')
  }
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})
// App.use(CqShopComponents)
App.use(CqButton)
export default App
