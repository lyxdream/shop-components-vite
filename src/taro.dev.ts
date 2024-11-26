import { App } from 'vue'
import CqButton from './packages/button/index'
export * from './packages/button/index'

function install(app: App) {
  const packages = [CqButton]
  packages.forEach((item: any) => {
    if (item.install) {
      app.use(item)
    } else if (item.name) {
      app.component(item.name, item)
    }
  })
}
import './packages/button/index.scss'

const version = '1.0.9'
export { install, version, CqButton }
export default { install, version }
