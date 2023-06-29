<template>
  <div class="input-box">
    <div class="prefix">
      <slot name="prefix"></slot>
    </div>
    <div class="title">{{ props.title }}:</div>
    <!-- <input class="input" v-model="inputData" type="text" /> -->
    <input v-if="props.isInput" class="input" :value="props.data" type="text" @input="$emit('update:data', $event.target.value)"/>
    <span v-else class="input readonly">{{ props.data }}</span>
    <div class="suffix">
      <slot name="suffix"></slot>
    </div>
  </div>
</template>

<script setup>
  import { ref,watchEffect } from 'vue'
  const props = defineProps({
    data: {
      type: [Object, String, Number],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    isInput: {
      type: Boolean,
      default: true
    },
  })


</script>

<style lang="less" scoped>
.input-box{
  height: 30px;
  line-height: 30px;
  display: flex;
  margin-right: 20px;
  .title{
    color: #fff;
    margin-right: 10px;
  }
  .input {
    flex: 1;
    height: 30px;
    line-height: 30px;
    border: 1px solid #d4e8ef;
    padding: 0 5px;
    box-sizing: border-box;
    outline: none;
    border-radius: 5px;
    background-color: #2f3241;
    color: #c2f5ff;
    width: 60%;
    // min-width: 50px;
  }
  .readonly{
    border: none;
  }
}
</style>
