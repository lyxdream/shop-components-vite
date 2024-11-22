import { createApp } from 'vue'
import './app.scss'
// import CqShopComponents from '../dist/cq-shop-components.es.js'
// import '../dist/style.css'
import CqShopComponents from '@/taro.dev'
console.log(CqShopComponents, '==CqShopComponents')
const App = createApp({
  onShow() {
    console.log('App onShow.')
  }
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})
App.use(CqShopComponents)

export default App
