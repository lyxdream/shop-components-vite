const packageConfig = require('../package.json')
const config = require('../src/config.json')
const path = require('path')
const fs = require('fs-extra')

// 需要导入的模块字符串
const IMPORT_TEMPLATE = `import { App } from 'vue'\n`
// 构建TypeScript声明文件的字符串
const DTS_TEMPLATE = `export {} 
declare module 'vue' {
  export interface GlobalComponents {\n`

/**
 * @description 生成一个用于安装插件的函数代码字符串
 * @param {Array} componentPackages 组件列表
 */
const generateInstallFunction = (componentPackages) => {
  return `function install(app: App) {
  const packages = [${componentPackages.join(',')}]
  packages.forEach((item:any) => {
    if (item.install) {
      app.use(item)
    } else if (item.name) {
      app.component(item.name, item)
    }
  })
}`
}
/**
 * @description 处理单个组件的配置，生成相应的导入语句、类型声明、SCSS 导入语句等。
 * @param {*} pkg 组件相关信息
 */
const processPackage = (pkg) => {
  let { name, exclude } = pkg
  const lowerName = name.toLowerCase()
  let importStatement = `import Cq${name} from './packages/${lowerName}/index'\nexport * from './packages/${lowerName}/index'\n`
  let methodStatements = ''
  const dtsStatement = `    Cq${name}: typeof import('./packages/${lowerName}/index')['default']\n`
  const scssImport = `import './packages/${lowerName}/index.scss'\n`
  return {
    name: !exclude && (`Cq${name}`),
    importStatement: importStatement + methodStatements,
    dtsStatement,
    scssImport
  }
}

/**
 * @description 生成所有组件的打包入口文件、vue类型声明
 */
const generateFiles = async () => {
  try {
    let importStr = IMPORT_TEMPLATE
    let dts = DTS_TEMPLATE
    let importScssStr = ''
    const componentPackages = []
    const methods = []
    config.nav.map((item) => {
      item.packages.forEach((pkg) => {
        const { name, importStatement, dtsStatement, scssImport } = processPackage(pkg)
        importStr += importStatement
        importScssStr += scssImport
        dts += dtsStatement
        if (name) componentPackages.push(name)
      })
    })
    const installFunction = generateInstallFunction(componentPackages)
    const version = packageConfig.version
    const methodNames = methods.join(',')
    const packagesName = componentPackages.join(',')

    const buildContent = `${importStr}\n${installFunction}\nconst version = '${version}'\nexport { install, version, ${packagesName}, ${methodNames}}\nexport default { install, version}`
    const devContent = `${importStr}\n${installFunction}\n${importScssStr}\nconst version = '${version}'\nexport { install, version, ${packagesName}, ${methodNames}}\nexport default { install, version }`

    await fs.outputFile(path.resolve(__dirname, '../src/taro.build.ts'), buildContent, 'utf8')
    await fs.outputFile(path.resolve(__dirname, '../src/taro.dev.ts'), devContent, 'utf8')
    await fs.outputFile(path.resolve(__dirname, '../src/components.d.ts'), dts + `  }\n}`, 'utf8')

    console.log('文件生成成功：')
    console.log('src/taro.build.ts')
    console.log('src/taro.dev.ts')
    console.log('src/components.d.ts')
  } catch (error) {
    console.error('文件生成失败:', error)
  }
}
generateFiles()
