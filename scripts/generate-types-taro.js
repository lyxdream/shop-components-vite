const config = require('../src/config.json')
const path = require('path')
const fs = require('fs-extra')

const preContent = `
declare type Install<T> = T & {
    install(app: import('vue').App): void;
};\n`
const start = 'declare const _default:'
const end = ';\nexport default _default;\n'
// 匹配从 start 开始到 end结束的字符串，并捕获中间的部分。
const regex = new RegExp(`${start}([\\s\\S]*?)${end}`)
const sourceDir = path.resolve(__dirname, '../tsc/type') // 拷贝的源文件夹
const toDir = path.resolve(__dirname, '../dist/types') // 目标目录 dist/types

// 获取文件名
const getFileName = (filePath) => {
  // 如：C:\Users\m1780\Desktop\新建文件夹\cq-shop-components-vite\dist\types\packages\button\button.vue.d.ts
  const lastSeparatorIndex = filePath.lastIndexOf(path.sep) // 获取最后一个路径分隔符的位置
  let name = filePath.substring(0, lastSeparatorIndex)
  // C:\Users\m1780\Desktop\新建文件夹\cq-shop-components-vite\dist\types\packages\button
  name = name.substring(name.lastIndexOf(path.sep) + 1)
  // path.sep 返回当前操作系统的路径分隔符。在 Windows 上是 \，在 macOS 和 Linux 上是 /。
  return name
}

const pathRewriter = () => {
  return (content) => {
    content = content.replaceAll(`@packages/`, `./packages/`)
    return content
  }
}

// 递归push文件路径到fileList
const getCompList = async (basePath) => {
  const fileList = []
  const files = await fs.readdir(basePath)

  for (const filename of files) {
    const filedir = path.join(basePath, filename)
    const stats = await fs.stat(filedir)
    const isFile = stats.isFile()
    const isDir = stats.isDirectory() // 是否是个文件夹

    if (isFile) {
      fileList.push(filedir)
    }

    if (isDir) {
      fileList.push(...await getCompList(filedir))
    }
  }

  return fileList
}

// 获取组件名  [ 'Button', true ]
const getCompName = (packages, name) => {
  if (!packages.length) {
    config.nav.forEach((item) => {
      packages = packages.concat(item.packages)
    })
  }
  const packageName = packages.find(item => item.name.toLowerCase() === name.toLowerCase())
  if (packageName) {
    if (packageName?.setup === true) {
      return [packageName.name, true]
    }
    return [packageName.name, false]
  }
  return ''
}

// 修改文件内容
const modifyFileContent = (inputs, content, componentName, setup) => {
  let remain = `
declare module 'vue' {
    interface GlobalComponents {
        Cq${componentName}: typeof _default;
    }
}`
  if (setup) {
    let changeContent = content.replace(
      'export default _default;',
      `declare const _cq_default: WithInstall<typeof _default>;\nexport default _cq_default;\n${remain}`
    )
    changeContent = `import type { WithInstall } from '../../utils';\n` + changeContent
    return changeContent
  } else {
    let changeContent = content.replace(regex, `${preContent}${start} Install<${inputs[1]}>${end}${remain}`)
    return changeContent
  }
}
// 处理组件声明文件的内容
const modifyTypeDefinitions = async (distPackages) => {
  try {
    let packages = []
    // 获取文件列表
    const fileList = await getCompList(distPackages)
    // 处理每个文件
    for (const item of fileList) {
      const content = await fs.readFile(item, 'utf-8')
      const inputs = content.match(regex)
      if (inputs && inputs.length) {
        let name = getFileName(item)
        const _ComponentName = getCompName(packages, name)
        if (_ComponentName) {
          const [componentName, setup] = _ComponentName
          const newContent = modifyFileContent(inputs, content, componentName, setup) // 修改文件内容
          await fs.writeFile(item, newContent, 'utf-8')
        }
      }
    }
  } catch (error) {
    console.log('组件声明文件的内容处理失败' + error)
  }
}

const generateTypesDefinitions = async (sourceDir, distBase) => {
  try {
    // 获取源文件夹路径
    const packagesDir = path.join(sourceDir, 'packages')
    const srcDir = path.join(sourceDir, 'src')
    // 获取目标文件夹路径
    const distPackages = path.join(distBase, 'packages')
    // 定义旧文件和新文件的路径
    const indexOldName = path.join(toDir, 'taro.build.d.ts')
    const indexNewName = path.join(toDir, 'index.d.ts')

    // 确保目标文件夹存在
    await fs.mkdir(path.dirname(distPackages), { recursive: true })
    await fs.mkdir(path.dirname(distBase), { recursive: true })

    // 复制 src 文件夹内容到 dist/types
    await fs.copy(srcDir, distBase, { recursive: true })
    console.log(`src声明文件写入成功`)

    // 重命名文件
    await fs.rename(indexOldName, indexNewName)

    // 替换index.d.ts文件里的路径
    const content = await fs.readFile(indexNewName, 'utf-8')
    await fs.writeFile(indexNewName, pathRewriter()(content), 'utf8')

    // 复制 packages 文件夹内容
    await fs.copy(packagesDir, distPackages, { recursive: true })
    console.log(`packages声明文件写入成功`)

    // 处理组件声明文件的内容
    await modifyTypeDefinitions(distPackages)

    console.log('所有类型声明文件写入成功')
  } catch (err) {
    console.error('类型声明文件写入失败:', err)
  }
}
generateTypesDefinitions(sourceDir, toDir)
