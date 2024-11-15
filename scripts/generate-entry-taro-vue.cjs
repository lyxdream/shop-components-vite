const packageConfig = require('../package.json')
const config = require('../src/config.json')
const path = require('path')
const fs = require('fs-extra')
let importStr = `import { App } from 'vue'\n`
let importScssStr = `\n`
let dts = `export {}
declare module 'vue' {
  export interface GlobalComponents {\n`
const packages = []
const methods = []
config.nav.map((item) => {
  item.packages.forEach((element) => {
    let { name, funcCall, exclude, setup } = element
    if (setup) {
      dts += `    Cq${name}: typeof import('@packages/${name.toLowerCase()}/index')['default']\n`
      importStr += `import ${name} from '@packages/${name.toLowerCase()}/index'\n`
      importStr += `export * from '@packages/${name.toLowerCase()}/index'\n`
    } else {
      dts += `    Cq${name}: typeof import('@packages/${name.toLowerCase()}/index.vue')['default']\n`
      importStr += `import ${name} from '@packages/${name.toLowerCase()}/index.vue'\n`
      if (funcCall === true) {
        importStr += `import { show${name} } from '@packages/${name.toLowerCase()}/index'\n`
        methods.push(`show${name}`)
      }
    }
    importScssStr += `import '@packages/${name.toLowerCase()}/index.scss'\n`
    if (!exclude) {
      packages.push(name)
    }
  })
})
let installFunction = `function install(app: App) {
  const packages = [${packages.join(',')}]
  packages.forEach((item:any) => {
    if (item.install) {
      app.use(item)
    } else if (item.name) {
      app.component(item.name, item)
    }
  })
}`
console.log(packages, '==packages')
let fileStrBuild = `${importStr}
${installFunction}
const version = '${packageConfig.version}'
export { install, version, ${packages.join(',')}, ${methods.join(',')}}
export default { install, version}`

fs.outputFile(path.resolve(__dirname, '../src/taro.build.ts'), fileStrBuild, 'utf8')
let fileStrDev = `${importStr}
${installFunction}
${importScssStr}
export { install, ${packages.join(',')}, ${methods.join(',')}  }
export default { install, version:'${packageConfig.version}'}`
fs.outputFile(path.resolve(__dirname, '../src/taro.ts'), fileStrDev, 'utf8')

dts += `  }
}`
// fs.outputFile(path.resolve(__dirname, '../packages/cq-shop-components-taro-demo/components.d.ts'), dts, 'utf8')
fs.outputFile(path.resolve(__dirname, '../src/components.d.ts'), dts, 'utf8')
