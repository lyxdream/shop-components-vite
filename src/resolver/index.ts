import type { ComponentResolveResult, ComponentResolver } from 'unplugin-vue-components/types'

export interface CqShopComponentsResolverOptions {
  /**
   * import style css 或 sass
   *
   * @default 'css'
   */
  importStyle?: boolean | 'css' | 'sass'

}

function getCqResolved(name: string, options: CqShopComponentsResolverOptions): ComponentResolveResult {
  const { importStyle = true } = options
  const packageName = 'cq-shop-components'

  if (!importStyle) return { name, from: packageName }

  let style = `${packageName}/dist/packages/${name.toLowerCase()}/style/css`

  if (importStyle === 'sass') {
    style = `${packageName}/dist/packages/${name.toLowerCase()}/style`
  }

  return {
    name,
    from: packageName,
    sideEffects: style
  }
}

/**
 *  CqShopComponents
 *
 */
export default function CqShopComponentsResolver(options: CqShopComponentsResolverOptions = {}): ComponentResolver {
  return {
    type: 'component',
    resolve: (name) => {
      if (name.startsWith('Cq')) return getCqResolved(name.slice(2), options)
    }
  }
}
