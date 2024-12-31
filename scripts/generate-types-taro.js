const path = require('path')
const fs = require('fs-extra')

const sourceDir = path.resolve(__dirname, '../tsc/type/src') // 拷贝的源文件夹
const toDir = path.resolve(__dirname, '../dist/types') // 目标目录 dist/types

const generateTypesDefinitions = async (sourceDir, distBase) => {
  try {
    // 获取目标文件夹路径
    // 复制 src 文件夹内容到 dist/types
    await fs.copy(sourceDir, distBase, { recursive: true })

    // 定义旧文件和新文件的路径
    const indexOldName = path.join(toDir, 'taro.build.d.ts')
    const indexNewName = path.join(toDir, 'index.d.ts')
    // 重命名文件
    await fs.rename(indexOldName, indexNewName)

    console.log('所有类型声明文件写入成功')
  } catch (err) {
    console.error('类型声明文件写入失败:', err)
  }
}
generateTypesDefinitions(sourceDir, toDir)
