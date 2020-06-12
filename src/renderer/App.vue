<template>
  <a-config-provider :locale="zhCN">
    <div id="app">
      <router-view/>
    </div>
  </a-config-provider>
</template>
<script>
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  export default {
    data() {
      return {
        zhCN,
      };
    }
  }
</script>
<style lang="less">
  html {
    margin: 0;
    padding: 0;
    border-radius: 0;
    overflow: hidden;
  }
  body {
    margin: 0;
    padding: 0;
    border-radius: 0;
   }
  #app {
    height: 100%;
    min-width: 1366px;
    border-radius: 0;
    background: #fff;
  }
</style>
