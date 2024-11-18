import pluginJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginTs from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

import parserVue from 'vue-eslint-parser'
import parserTs from '@typescript-eslint/parser'
import globals from 'globals'
import gitignore from 'eslint-config-flat-gitignore'

export default [
  gitignore(),
  pluginJs.configs.recommended,
  stylistic.configs.customize({
    quoteProps: 'as-needed',
    commaDangle: 'never',
    braceStyle: '1tbs'
  }),
  ...pluginTs.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {

      'no-trailing-spaces': 'error', // 禁止行尾有多余的空格
      'object-curly-spacing': ['error', 'always'], // 对象字面量的花括号之间必须有空格
      // 'arrow-parens': ['error', 'as-needed'], // 箭头函数参数可以省略圆括号
      'no-empty': ['error', { // no-empty 规则禁止使用空的代码块（如空的 if 或 try-catch 块）。
        allowEmptyCatch: true
      }],
      // typescript-eslint
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // 关闭了禁止显式使用 any 类型的规则
      '@typescript-eslint/ban-types': 'off', // 关闭了禁止使用某些特定类型的规则，比如 Function 和 Object。
      '@typescript-eslint/no-var-requires': 'off', // 关闭了禁止使用 require 表达式的规则
      '@typescript-eslint/no-require-imports': 'off', // 闭了禁止使用 import 之外的其他模块加载语法的规则。
      '@typescript-eslint/no-unsafe-function-type': 'off', // 关闭了禁止使用可能不安全的函数类型的规则。
      '@typescript-eslint/no-unused-vars': ['error', {
        caughtErrors: 'none'
      }], // 启用了禁止未使用的变量的规则，并且特别指定了捕获到的错误不需要声明为已处理。
      '@typescript-eslint/ban-ts-comment': 'off', // 关闭了禁止使用 TypeScript 的注释指令（如 // @ts-ignore）的规则。
      // eslint-plugin-vue  DOM 属性使用短横线命名（kebab-case）
      'vue/v-on-event-hyphenation': [
        'error',
        'always',
        {
          autofix: true
        }
      ],
      'vue/no-v-html': 'off', // 关闭了禁止使用 v-html 指令的规则
      //  HTML 属性值使用双引号
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: {
            max: 3
          },
          multiline: {
            max: 1
          }
        }
      ], // 此规则限制了单行和多行元素上的最大属性数量
      'vue/multi-word-component-names': [
        'off',
        {
          ignores: []
        }
      ],
      'vue/no-v-text-v-html-on-component': 'off', // 防止在自定义 Vue 组件上直接使用 v-text 和 v-html 指令
      'vue/block-order': ['error', {
        order: [['script', 'template'], 'style']
      }],
      'vue/html-self-closing': 'off',
      'vue/html-closing-bracket-newline': [
        'error', // 错误级别
        {
          multiline: 'always' // 多行元素的闭合括号必须换行
        }
      ],
      // 组件名称必须使用大驼峰形式（例如 MyComponent）。
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: [
            '/(swiper|swiper-item|scroll-view|web-view|movable-area|movable-view|rich-text|picker|cq-button)/' // 忽略小程序组件
          ]
        }
      ]
    }
  },
  {
    languageOptions: {
      parser: parserVue,
      globals: {
        ...globals.browser,
        ...globals.node,
        vi: true,
        NodeJS: true,
        TaroGeneral: true
      },
      parserOptions: {
        parser: parserTs,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  }
]
