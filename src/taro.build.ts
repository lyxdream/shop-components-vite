import { App } from 'vue'
import Button from '@packages/button/index'
export * from '@packages/button/index'

function install(app: App) {
  const packages = [Button]
  packages.forEach((item: any) => {
    if (item.install) {
      app.use(item)
    } else if (item.name) {
      app.component(item.name, item)
    }
  })
}
const version = '1.0.8'
export { install, version, Button }
export default { install, version }
