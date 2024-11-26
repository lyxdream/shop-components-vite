import type { App, Component, Plugin, AppContext } from 'vue'

// export type SFCWithInstall<T> = T & WithInstall<T>
export type SFCWithInstall<T> = T & Plugin

export type SFCInstallWithContext<T> = SFCWithInstall<T> & {
  _context: AppContext | null
}

export type WithInstall<T> = T & {
  install(app: App): void
}

export const withInstall = <T extends Component>(comp: T) => {
  const _comp = comp as WithInstall<T>
  _comp.install = (vue: App) => {
    if (_comp.name) {
      vue.component(_comp.name, _comp)
    }
  }

  return _comp as WithInstall<T>
}

export const withInstallFunction = <T>(fn: T, name: string) => {
  const installFn = fn as SFCWithInstall<T>
  installFn.install = (app: App) => {
    ;(installFn as SFCInstallWithContext<T>)._context = app._context
    app.config.globalProperties[name] = installFn
  }

  return installFn as SFCInstallWithContext<T>
}
