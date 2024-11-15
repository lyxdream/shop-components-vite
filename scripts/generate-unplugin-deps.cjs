#!/usr/bin/env node
const config = require('../src/config.json')
const packageConfig = require('../package.json')
const path = require('path')
const fs = require('fs-extra')

// 获取依赖关系
const styleMap = new Map()
const tasks = []
let outputFileEntry = ``
let components = []
config.nav.forEach((item) => {
  item.packages.forEach((element) => {
    styleMap.set(element.name, {
      name: element.name
    })
    // entry
    if (element.exclude !== true) {
      let outputMjs = ''
      if (element.funcCall === true) {
        outputMjs = `import ${element.name} from './${element.name}.js';
import { show${element.name} } from './${element.name}.js';
export { ${element.name}, show${element.name}, ${element.name} as default };`
      } else {
        outputMjs = `import ${element.name} from './${element.name}.js';
export { ${element.name}, ${element.name} as default };`
      }
      let folderName = element.name.toLowerCase()
      tasks.push(
        fs.outputFile(path.resolve(__dirname, `../dist/packages/${folderName}/index.mjs`), outputMjs, 'utf8')
      )
      outputFileEntry += `export * from "./packages/${folderName}/index.mjs";\n`
      components.push(element.name)
    }
  })
})
outputFileEntry += components
  .map(name => `import { ${name} } from "./packages/${name.toLowerCase()}/index.mjs";`)
  .join('\n')
outputFileEntry += `\nexport function install(app) {
  const packages = [${components.join(',')}];
  packages.forEach((item) => {
    if (item.install) {
      app.use(item);
    } else if (item.name) {
      app.component(item.name, item);
    }
  });
}
export const version = '${packageConfig.version}';
export default {
  install,
  version
};`

tasks.push(
  fs.outputFile(path.resolve(__dirname, `../dist/cq-shop-components.es.js`), outputFileEntry, 'utf8')
)

// 处理css
styleMap.forEach((value, key) => {
  const name = key.toLowerCase()
  // style
  const outputStyleMjs = `import '../../../styles/reset.css';\nimport '../index.scss';\n`
  const outputStyleCssMjs = `import '../../../styles/reset.css';\nimport '../index.css';\n`
  tasks.push(
    fs.outputFile(path.resolve(__dirname, `../dist/packages/${name}/style/index.mjs`), outputStyleMjs, 'utf8')
  )
  tasks.push(
    fs.outputFile(path.resolve(__dirname, `../dist/packages/${name}/style/css.mjs`), outputStyleCssMjs, 'utf8')
  )
})

Promise.all(tasks)
