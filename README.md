# 电商组件库

轻量级 Vue 组件库，支持移动端 H5 和 微信小程序开发

## 功能

* 支持一套代码同时开发 H5+微信小程序
* 支持 TypeScript
* 支持按需引用
* 支持自动按需引入 CqShopComponentsResolver
* 支持动态定制主题
* 支持组件级别定制主题，内置 700+ 个变量
* 分为基础组件、业务组件、组合组件三种类型
* 文档和示例

后续增加功能：

* 支持单元测试
* 支持 vscode 组件属性高亮
* 支持 ConfigProvider 全局配置

## 引入功能介绍

### 全局引入

```ts
// app.ts
import { createApp } from 'vue'
import CqShopComponents from "@wm/cq-shop-components";
import "@wm/cq-shop-components/dist/style.css";

const App = createApp({
  onShow (options) {},
})
App.use(CqShopComponents);
export default App

```

### 按需引入

```ts
// app.ts
import { createApp } from 'vue'
import { Button } from "@wm/cq-shop-components";
import "@wm/cq-shop-components/dist/style.css";

const App = createApp({
  onShow (options) {},
})
App.use(Button);
export default App

```

#### 自动按需引入

自动按需引入需要先引入CqShopComponentsResolver，并且安装unplugin-vue-components

```bash
npm i unplugin-vue-components -D
```

```js
// config/index.js
import ComponentsPlugin from 'unplugin-vue-components/webpack'
import CqShopComponentsResolver from '@wm/cq-shop-components/dist/resolver'

const config = {
  // 小程序开发
  mini: {
    webpackChain(chain) {
      chain.plugin('unplugin-vue-components').use(ComponentsPlugin({
        resolvers: [CqShopComponentsResolver()]
      }))
    },
  },
  // Taro-H5 开发
  h5: {
    webpackChain(chain) {
      chain.plugin('unplugin-vue-components').use(ComponentsPlugin({
        resolvers: [CqShopComponentsResolver()]
      }))
    },
  }
}

```

配置完成后，可以直接在模板中使用 CqShopComponents 组件，unplugin-vue-components 插件会自动注册对应的组件，并按需引入组件样式。

**直接使用**
```vue
<template>
  <cq-button></cq-button>
</template>

```
**无需手动引入和注册**

```vue
// import { Button } from '@wm/cq-shop-components';
// app.use(Button)
```


## 主题定制功能

### 使用 css变量 进行主题配置

组件可以通过 CSS 变量 来组织样式，通过覆盖这些 CSS 变量，可以实现定制主题、动态切换主题等功能。

这些变量的默认值被定义在 page 节点上，如果要转 H5，默认值被定义在 :root 节点上如下：

```scss
:root,
page {
  --cq-primary-color: #fa2c19;
  --cq-primary-color-end: #fa6419;
  ....
}
```
通过 CSS 覆盖：

- 如果修改全局变量

在app.scss里面进行覆盖

```css
:root,
page {
  --cq-primary-color: green;
}
```

- 如果修改组件变

可以直接需要修改的页面覆盖这些 CSS 变量，Button 组件的样式会随之发生改变：

```css
:root,
page {
  --cq-button-primary-background-color: green;
}
```

### 使用 Sass 变量 进行主题配置

新建自定义变量 SCSS 文件

1. 在本地项目中新建一个 SCSS 文件 custom_theme.scss 进行自定义。

```scss
// 主色调
$primary-color: #478EF2;
$primary-color-end: #496AF2;
```
2. 修改 taro 小程序配置文件

修改 config/index.ts 文件，配置 scss 文件全局覆盖。如：

```ts
const path = require('path');
const config = {
  ...
  sass: {
    resource: [
      path.resolve(__dirname, '..', 'src/assets/styles/custom_theme.scss')
    ],
    data: `@import "@wm/cq-shop-components/dist/styles/variables.scss";`
  },
}

```