import Button from './button.vue'
import type { ComponentPublicInstance } from 'vue'
import { withInstall, SFCWithInstall } from '../../utils'

const CqButton: SFCWithInstall<typeof Button> = withInstall(Button)
export { CqButton, CqButton as default }

export type { ButtonProps } from './button.vue'

export type { ButtonType, ButtonSize, ButtonShape, ButtonFormType } from './types'

export type ButtonInstance = ComponentPublicInstance & InstanceType<typeof Button>
