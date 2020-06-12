<template>
    <div class="container">
        <TopBar></TopBar>
        <div class="container-content">
            <router-view/>
        </div>
    </div>
</template>

<script>
    import TopBar from '@/layout/components/TopBar'

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

        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
            background-color: rgba(255, 255, 255, 0.98);
        }
        ::-webkit-scrollbar-thumb {
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
            background-color: rgba(130, 130, 130, 0.97);
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
        .container-content {
            margin-top: 50px;
            height: calc(100% - 50px);
            overflow-y: scroll;
            border-radius: 0;
            background: #fff;

            ::-webkit-scrollbar {
                width: 6px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
                background-color: rgba(255, 255, 255, 0.98);
            }
            ::-webkit-scrollbar-thumb {
                -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
                background-color: rgba(130, 130, 130, 0.1);
            }
        }
    }
</style>