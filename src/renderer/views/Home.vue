<template>
      <div class="container">
            <div class="header">
                <div class="logo">Conte Reader</div>
                <div class="operate">
                    <div></div>
                </div>
            </div>
            <div class="content">
                <div class="sider"></div>
                <div class="title"></div>
                <div class="detail"></div>
            </div>
      </div>
</template>

<script>

export default {
  name: 'Home',
  components: {
  }
}
</script>

<style lang="less">
    .container {
        width: 100%;
        border-radius: 2px 2px 0 0;
    }
    .header {
        position: absolute;
        top: 0;
        width: 100%;
        height: 50px;
        background: #4F4F4F;
        color: aliceblue;
        border-radius: 2px 2px 0 0;
        -webkit-app-region: drag;
        .logo {
            display: inline-block;
            width: 200px;
            height: 50px;
            line-height: 50px;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
        .operate {
            display: inline-block;
            width: 260px;
        }
    }
    .content {
        margin-top: 50px;
        height: calc(100vh - 50px);
        overflow: hidden;
        border-radius: 0;
        background: #fff;
        .sider,.title,.detail {
            display: inline-block;
            height: 100%;
        }
        .sider {
            background: #828282;
            width: 200px;
        }
        .title {
            background: #F7F6F3;
            width: 260px;
        }
    }
</style>