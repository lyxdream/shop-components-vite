#!/usr/bin/env node
const config = require('../src/config.json')
const packageConfig = require('../package.json')
const path = require('path')
const fs = require('fs-extra')

const rootDir = path.resolve(__dirname, '..')
const tasks = []
const components = []
let outputFileEntry = ''

// 生成基础的组件导入和导出语句 componentName, funcCall
/**
 *@description 生成基础的组件导入和导出语句
 * @param {*} componentName 组件名称
 * @returns
 */
const generateBaseComponentImportExport = (componentName) => {
  const importStatement = `import Cq${componentName} from './${componentName}.js';\n`
  let exportStatement = `export { Cq${componentName}, Cq${componentName} as default };`

  return {
    importStatement,
    exportStatement
  }
}
// 组件的入口文件
const createComponentEntry = async (component) => {
  try {
    const { name } = component
    const componentFolderName = name.toLowerCase()
    const { importStatement, exportStatement } = generateBaseComponentImportExport(name)
    const outputMjs = `${importStatement}${exportStatement}`
    const outputFile = path.resolve(rootDir, `dist/packages/${componentFolderName}/index.mjs`)
    await fs.outputFile(outputFile, outputMjs, 'utf8')
    // outputFileEntry 总包的mjs文件引入单个组件
    outputFileEntry += `export * from "./packages/${componentFolderName}/index.mjs";\n`
    components.push(component.name)
  } catch (error) {
    console.error(`组件插件依赖入口创建失败${component.name}:`, error)
  }
}
// 样式的入口
const createStyleFiles = async (component) => {
  try {
    const name = component.name.toLowerCase()
    const outputStyleMjs = `import '../../../styles/reset.css';\nimport '../index.scss';\n`
    const outputStyleCssMjs = `import '../../../styles/reset.css';\nimport '../index.css';\n`
    await fs.outputFile(path.resolve(rootDir, `dist/packages/${name}/style/index.mjs`), outputStyleMjs, 'utf8')
    await fs.outputFile(path.resolve(rootDir, `dist/packages/${name}/style/css.mjs`), outputStyleCssMjs, 'utf8')
  } catch (error) {
    console.error(`样式插件依赖入口创建失败${component.name}:`, error)
  }
}

// 生成总包的入口文件
const createAllEntry = async () => {
  try {
    const importStatements = components.map(name => `import { Cq${name} } from "./packages/${name.toLowerCase()}/index.mjs";`).join('\n')
    const prefixedPackages = components.map(name => `Cq${name}`)
    const componentNames = prefixedPackages.join(',')
    // 生成install函数
    outputFileEntry += `${importStatements}\nexport function install(app) {
  const packages = [${componentNames}];
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
    const finalOutputFile = path.resolve(rootDir, 'dist/cq-shop-components.es.js')
    await fs.outputFile(finalOutputFile, outputFileEntry, 'utf8')
  } catch (e) {
    console.log('总包的mjs入口文件生成失败')
  }
}

// 根据配置生成任务列表
const generateTaskListFromConfig = () => {
  config.nav.forEach((item) => {
    item.packages.forEach((element) => {
      if (!element.exclude) {
        tasks.push(createComponentEntry(element))
        tasks.push(createStyleFiles(element))
      }
    })
  })
  return tasks
}

// 生成/更新用于style和组件esm的 unplugin 入口文件
const executeTasksAndCreateFinalEntry = async () => {
  try {
    const taskList = generateTaskListFromConfig()
    await Promise.all(taskList)
    await createAllEntry()
  } catch (error) {
    console.error(`组件入口文件创建失败:`, error)
  }
}

executeTasksAndCreateFinalEntry()
