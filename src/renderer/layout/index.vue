<template>
    <div class="container">
        <TopBar></TopBar>
        <div class="content">
            <router-view/>
        </div>
    </div>
</template>

<script>
    import TopBar from '@/layout/components/header'

    export default {
        name: "index",
        components: {
            TopBar
        }
    }
</script>

<style lang="less" scoped>
    .container {
        height: 100%;
        width: 100%;
        border-radius: 0;
    }
    .header {
        position: absolute;
        top: 0;
        width: 100%;
        height: 50px;
        background: #4F4F4F;
        color: aliceblue;
        border-radius: 0;
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
            text-align: center;
            .item {
                -webkit-app-region: no-drag;
                display: inline-block;
                cursor: pointer;
                margin-right: 20px;
                i {
                    font-size: 16px;
                }
            }
        }
        .tool {
            -webkit-app-region: no-drag;
            display: inline-block;
            float: right;
            padding: 12px 0 0 0;
            .item {
                -webkit-app-region: no-drag;
                display: inline-block;
                cursor: pointer;
                margin-right: 10px;
                i {
                    font-size: 14px;
                }
            }
        }
    }
    .content {
        margin-top: 50px;
        height: calc(100% - 50px);
        overflow: hidden;
        border-radius: 0;
        background: #fff;
        .sider,.title,.detail {
            display: inline-block;
            height: 100%;
        }
        .title,.detail {
            overflow-y: scroll;
        }
        .sider {
            position: fixed;
            background: #828282;
            width: 200px;
            .feed-list {
                width: 100%;
                color: white;
                text-align: center;
                .feed-list-item {
                    padding: 10px;
                    cursor: pointer;
                    .feed-title {
                        text-align: left;
                        width: 100%;
                        height: 100%;
                    }
                }
            }
        }
        ::-webkit-scrollbar {
            width: 6px; /*滚动条宽度*/
            height: 6px;  /*滚动条高度*/
        }
        /*定义滚动条轨道 内阴影+圆角*/
        ::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
            border-radius: 2px;  /*滚动条的背景区域的圆角*/
            background-color: rgba(255, 255, 255, 0.98);/*滚动条的背景颜色*/
        }
        /*定义滑块 内阴影+圆角*/
        ::-webkit-scrollbar-thumb {
            border-radius: 2px; /*滚动条的圆角*/
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
            background-color: rgba(130, 130, 130, 0.97);  /*滚动条的背景颜色*/
        }
        .title {
            position: fixed;
            margin-left: 200px;
            padding: 10px 20px;
            background: #F7F6F3;
            width: 260px;

            .title-list {
                .title-list-item {
                    cursor: pointer;
                }
            }
        }
        .detail {
            margin-left: 460px;
            padding: 10px 20px;
            width: calc(100% - 460px);
            /deep/ #js_content {
                visibility: visible !important;
            }
        }
    }
</style>