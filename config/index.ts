import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
// import ComponentsPlugin from 'unplugin-vue-components/webpack'
import devConfig from './dev'
import prodConfig from './prod'
import path from 'path'

// eslint-disable-next-line no-empty-pattern
export default defineConfig(async (merge, {}) => {
  const baseConfig: UserConfigExport = {
    projectName: 'miniapp-demo',
    date: '2024-11-14',
    designWidth() {
      return 750
    },
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'examples',
    outputRoot: `examplesDist/${process.env.TARO_ENV}`,
    plugins: [],
    sass: {
      resource: [path.resolve(__dirname, '../src/styles/variables.scss')]
    },
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'vue3',
    compiler: {
      type: 'webpack5',
      prebundle: {
        exclude: ['cq-shop-components'],
        enable: false,
        force: true
      }
    },
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      optimizeMainPackage: {
        enable: true
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            // selectorBlackList: ['nut-']
          }
        },
        url: {
          enable: true,
          config: {
            limit: 1024 // 设定转换尺寸上限
          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        chain.merge({
          module: {
            rule: [
              {
                test: /.(js|ts)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
              }
            ]
          }
        })
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[fullhash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[fullhash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        chain.merge({
          module: {
            rule: [
              {
                test: /.(js|ts)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
              }
            ]
          }
        })
        chain.merge({
          performance: { maxEntrypointSize: 10000000, maxAssetSize: 30000000 }
        })
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
