const fs = require('fs-extra')
const path = require('path')
const sass = require('sass')
const config = require('../src/config.json')
const rootDir = path.resolve(__dirname, '..')

// 主题枚举
const themesEnum = {
  cqdj: 'variables-cqdj'
}
let sassFileStr = `` // 引入的组件样式

// 统一错误处理函数
const handleError = (error, operationName) => {
  console.error(`${operationName}失败:`, error)
  throw error
}

// 编译SASS为css
const compileSass = async (filePath, outputFilePath) => {
  try {
    const result = sass.compile(filePath, { style: 'compressed' })
    await fs.unlinkSync(filePath)
    await fs.outputFile(outputFilePath, result.css, 'utf8')
  } catch (error) {
    handleError(error, 'SASS编译')
  }
}
// 解析scss变量到一个对象
// 如 $primary-color: var(--cq-primary-color, #fa2c19) !default;=>{'$primary-color': '#fa2c19 !default',}
const getScssVariables = (data) => {
  const variables = {}
  const lines = data.split('\n')
  lines.forEach((line) => {
    if (line.startsWith('$')) {
      const trimmedLine = line.trim().replace(';', '')
      const [key, value] = trimmedLine.split(': ')
      variables[key] = value
    }
  })
  return variables
}

// SCSS 变量转换为 CSS 变量
const convertScssToCssVariables = (variables) => {
  let fileContent = ''
  for (const key in variables) {
    // 检查是否是variables本身的属性
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      // 键中去掉第一个字符$
      const variableName = key.slice(1)
      fileContent += `  --cq-${variableName}: #{$${variableName}};\n`
    }
  }
  return fileContent
}

// 将样式相关文件拷贝到dist目录
const copyFiles = async () => {
  try {
    let copyFilesTasks = []
    // 拷贝单个组件的index.scss
    config.nav.forEach((item) => {
      item.packages.forEach((element) => {
        let folderName = element.name.toLowerCase()
        if (!element.exclude) {
          sassFileStr += `@import '../../packages/${folderName}/index.scss';\n`
        }
        const sourcePath = path.join(rootDir, `packages/${folderName}/index.scss`)
        const targetPath = path.join(rootDir, `dist/packages/${folderName}/index.scss`)

        copyFilesTasks.push(
          fs.copy(sourcePath, targetPath)
        )
      })
    })
    // 拷贝style文件夹
    const sourceStylePath = path.join(rootDir, 'src/styles')
    const targetStylePath = path.join(rootDir, 'dist/styles')
    copyFilesTasks.push(
      fs.copy(sourceStylePath, targetStylePath)
    )
    await Promise.all(copyFilesTasks)
    console.log(`sass文件写入成功`)
  } catch (error) {
    handleError(error, 'sass文件写入')
  }
}

// 将scss文件额外转换一份css
const sassTocss = async () => {
  try {
    let sassTocssTasks = []
    config.nav.map((item) => {
      item.packages.forEach((element) => {
        const folderName = element.name.toLowerCase()
        sassTocssTasks.push(
          writeAndCompileSass(folderName)
        )
      })
    })
    await Promise.all(sassTocssTasks)
    console.log(`css文件写入成功`)
  } catch (error) {
    handleError(error, 'css文件写入')
  }
}
// 异步写入文件并编译为CSS
const writeAndCompileSass = async (folderName) => {
  try {
    // 写入main.scss，引入变量文件variables.scss和组件样式index.scss
    const filePath = path.join(rootDir, `dist/packages/${folderName}/main.scss`)
    const cssFilePath = path.join(rootDir, `dist/packages/${folderName}/index.css`)
    const content = `@import '../../styles/variables.scss';\n@import './index.scss';\n`
    await fs.outputFile(filePath, content, 'utf8')
    // 编译sass为css
    await compileSass(filePath, cssFilePath)
  } catch (error) {
    handleError(error, '写入并编译SASS为CSS')
  }
}

// 解析scss主题文件，生成css主题文件
const parseFile = async (filename, theme = 'default') => {
  try {
    const base = theme === 'default' ? 'base' : `base-${theme}`
    const filePath = path.join(rootDir, `dist/styles/${base}.scss`)
    const outputFilePath = path.join(rootDir, `dist/styles/${base}.css`)

    // 解析scss变量
    const data = await fs.readFile(filename, 'utf-8')
    const variables = getScssVariables(data)
    let fileContent = `@import './${themesEnum[theme]}.scss';\n:root {\n${convertScssToCssVariables(variables)}}`
    await fs.outputFile(filePath, fileContent, 'utf8')

    // 编译sass为css
    await compileSass(filePath, outputFilePath)
  } catch (err) {
    handleError(err, '生成css变量')
  }
}

// 循环themesEnum，生成不同主题的含css变量的文件
const variablesResolver = async () => {
  try {
    let variablesResolverTasks = []
    Object.keys(themesEnum).forEach((theme) => {
      const filename = path.join(rootDir, `dist/styles/${themesEnum[theme]}.scss`)
      variablesResolverTasks.push(
        parseFile(filename, theme)
      )
    })
    await Promise.all(variablesResolverTasks)
    console.log('base文件写入成功')
  } catch (error) {
    handleError(error, 'base文件写入')
  }
}

// 生成各个主题的themes文件
const generateThemesFiles = async () => {
  try {
    let themes = [
      { file: 'default.scss', sourcePath: `@import '../variables.scss';` },
      { file: 'cqdj.scss', sourcePath: `@import '../variables-cqdj.scss';` }
    ]
    const tasks = themes.map(async (item) => {
      const filePath = path.join(rootDir, `dist/styles/themes/${item.file}`)
      const fileContent = `${item.sourcePath}\n${sassFileStr}`
      await fs.outputFile(
        filePath,
        fileContent,
        'utf8'
      )
    })
    await Promise.all(tasks)
    console.log('themes文件写入成功！')
  } catch (error) {
    handleError(error, 'themes文件写入')
  }
}

async function generateStyle() {
  try {
    await copyFiles() // 复制文件到dist目录
    await sassTocss()// 将scss文件额外转换一份css
    await variablesResolver() // 解析各个主题的scss文件，生成主题对应的css变量
    await generateThemesFiles() // 生成主题themes文件夹
  } catch (error) {
    handleError(error, '生成样式相关操作')
  }
}
generateStyle()
