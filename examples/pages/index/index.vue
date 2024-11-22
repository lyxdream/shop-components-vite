<template>
  <view class="index">
    <text>{{ msg }}</text>
    <cq-button type="primary">
      Primary
    </cq-button>
  </view>
</template>

<script>
import { ref } from 'vue'
import './index.scss'

export default {
  setup() {
    const msg = ref('Hello world')
    return {
      msg
    }
  }
}
</script>
