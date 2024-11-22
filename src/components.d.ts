export {}
declare module 'vue' {
  export interface GlobalComponents {
    CqButton: typeof import('@packages/button/index')['default']
  }
}
