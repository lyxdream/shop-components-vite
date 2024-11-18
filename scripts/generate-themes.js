const fs = require('fs-extra')
const path = require('path')
const sass = require('sass')

const config = require('../src/config.json')

const themesEnum = {
  cqdj: 'variables-cqdj'
}
const rootDir = path.resolve(__dirname, '..')

let sassFileStr = `` // 引入的组件样式

// 将样式相关文件拷贝到dist目录
const copyFiles = async () => {
  let copyFilesTasks = []
  // 拷贝单个组件的index.scss
  config.nav.map((item) => {
    item.packages.forEach((element) => {
      let folderName = element.name.toLowerCase()
      if (!element.exclude) {
        sassFileStr += `@import '../../packages/${folderName}/index.scss';\n`
      }
      copyFilesTasks.push(
        fs.copy(
          path.resolve(__dirname, `../packages/${folderName}/index.scss`),
          path.resolve(__dirname, `../dist/packages/${folderName}/index.scss`)
        )
          .catch((error) => {
            console.error(error)
          })
      )
    })
  })
  // 拷贝style文件夹
  copyFilesTasks.push(
    fs.copy(path.join(rootDir, 'src/styles'), path.join(rootDir, 'dist/styles'))
  )
  try {
    await Promise.all(copyFilesTasks)
    console.log(`sass文件写入成功`)
  } catch (error) {
    console.error('sass文件写入失败', error)
  }
}

// 将scss文件额外转换一份css
const sassTocss = async () => {
  let sassTocssTasks = []
  config.nav.map((item) => {
    item.packages.forEach((element) => {
      // 写入main.scss，引入变量文件variables.scss和组件样式index.scss
      const folderName = element.name.toLowerCase()
      const filePath = path.join(rootDir, `dist/packages/${folderName}/main.scss`)
      const content = `@import '../../styles/variables.scss';\n@import './index.scss';\n`
      sassTocssTasks.push(
        (async () => {
          try {
            await fs.outputFile(filePath, content, 'utf8')
            const result = sass.compile(filePath, { style: 'compressed' })// 编译sass为css
            await fs.unlink(filePath) // 删除main.scss
            await fs.outputFile(path.join(rootDir, `dist/packages/${folderName}/index.css`), result.css, 'utf8') // 写入index.css
          } catch (error) {
            console.error(`写入失败${folderName} SASS to CSS:`, error)
          }
        })()
      )
    })
  })
  try {
    await Promise.all(sassTocssTasks)
    console.log(`css文件写入成功`)
  } catch (error) {
    console.error('css文件写入失败:', error)
  }
}

// 解析scss文件，生成css变量
const parseFile = (filename, theme = 'default') => {
  return fs.readFile(filename, 'utf-8', (err, data) => {
    if (err) {
      console.error(`无法读取文件: ${err}`)
      return
    }

    const variables = {}
    const lines = data.split('\n')
    lines.forEach((line) => {
      if (line.startsWith('$')) {
        const trimmedLine = line.trim().replace(';', '')
        const [key, value] = trimmedLine.split(': ')
        variables[key] = value
      }
    })

    let fileContent = `@import './${themesEnum[theme]}.scss';\n:root {\n`
    for (const key in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        const variableName = key.slice(1)
        fileContent += `  --cq-${variableName}: #{$${variableName}};\n`
      }
    }
    fileContent += `}`
    const base = theme === 'default' ? 'base' : `base-${theme}`
    const filePath = path.join(rootDir, `dist/styles/${base}.scss`)
    fs.outputFile(filePath, fileContent, 'utf8', (error) => {
      if (error) return console.error(error)
      // 编译sass为css
      const result = sass.compile(filePath, { style: 'compressed' })
      // base.scss
      fs.unlinkSync(filePath)
      // base.css
      fs.outputFile(path.join(rootDir, `dist/styles/${base}.css`), result.css, 'utf8', (error) => {
        if (error) return console.log(error)
      })
    })
  })
}

// 循环themesEnum，生成不同的css变量主题
const variablesResolver = () => {
  let variablesResolverTasks = []
  Object.keys(themesEnum).forEach((theme) => {
    variablesResolverTasks.push(
      parseFile(path.join(rootDir, `dist/styles/${themesEnum[theme]}.scss`), theme)
    )
  })
  Promise.all(variablesResolverTasks).then(() => {
    console.log('base文件写入成功')
  })
}

// 生成各个主题的themes文件
const generateThemesFiles = () => {
  let tasks = []
  let themes = [
    { file: 'default.scss', sourcePath: `@import '../variables.scss';` },
    { file: 'cqdj.scss', sourcePath: `@import '../variables-cqdj.scss';` }
  ]

  themes.forEach((item) => {
    tasks.push(
      fs.outputFile(
        path.join(rootDir, `dist/styles/themes/${item.file}`),
        `${item.sourcePath}\n${sassFileStr}`,
        'utf8',
        (error) => {
          if (error) return console.error(error)
        }
      )
    )
  })
  Promise.all(tasks).then(() => {
    console.log('themes文件写入成功！')
  })
}

async function generateThemes() {
  try {
    await copyFiles() // 复制文件到dist目录
    await sassTocss()
    await variablesResolver()
    await generateThemesFiles()
  } catch (error) {
    console.error('Error:', error)
  }
}
generateThemes()
