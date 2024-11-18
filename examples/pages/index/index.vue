<template>
  <view class="index">
    <text>{{ msg }}</text>
    <!-- <nut-button type="primary">Primary</nut-button> -->
    <cq-button type="primary">
      Primary
    </cq-button>
    <!-- <cq-button type="primary">Primary</cq-button>
    <CqButton type="primary">Primary</CqButton> -->
    <!-- <button>2222</button> -->
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
