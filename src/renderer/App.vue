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
    border-radius: 2px 2px 0 0;

    /*//overflow-y: hidden;*/
    overflow: hidden;
    /*!*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*!*/
    /*::-webkit-scrollbar {*/
    /*  width: 2px; !*滚动条宽度*!*/
    /*  !*height: 2px;  !*滚动条高度*!*!*/
    /*}*/

    /*!*定义滚动条轨道 内阴影+圆角*!*/
    /*::-webkit-scrollbar-track {*/
    /*  !*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*!*/
    /*  !*border-radius: 10px;  !*滚动条的背景区域的圆角*!*!*/
    /*  !*background-color: red;!*滚动条的背景颜色*!*!*/
    /*}*/

    /*!*定义滑块 内阴影+圆角*!*/
    /*::-webkit-scrollbar-thumb {*/
    /*  border-radius: 99px; !*滚动条的圆角*!*/
    /*  !*-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);*!*/
    /*  !*background-color: green;  !*滚动条的背景颜色*!*!*/
    /*}*/
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
