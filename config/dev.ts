import type { UserConfigExport } from '@tarojs/cli'
import TerserPlugin from 'terser-webpack-plugin'
// import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'
export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {
    webpackChain: (chain) => {
      // chain.plugin('analyzer').use(BundleAnalyzerPlugin),
      chain.merge({
        plugin: {
          // 解决包体积过大无法进行预览的问题
          terse: {
            plugin: TerserPlugin,
            args: [
              {
                test: /\.js(\?.*)?$/i,
                minify: TerserPlugin.swcMinify,
                parallel: true,
                terserOptions: {
                  compress: true,
                  sourceMap: true
                }
              }
            ]
          }
        }
      })
    }
  },
  h5: {}
} satisfies UserConfigExport
