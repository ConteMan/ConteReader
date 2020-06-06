<template>
    <div class="header">
        <div class="logo">Conte Reader</div>
        <div class="operate">
            <div class="item">
                <i class="conte conte-home"></i>
            </div>
            <div class="item" @click="showAdd">
                <i class="conte conte-appstoreadd"></i>
            </div>
            <div class="item">
                <i class="conte conte-setting"></i>
            </div>
        </div>
        <div class="tool">
            <div class="item" @click="winControl('minimize')">
                <i class="conte conte-zuixiaohua"></i>
            </div>
            <div class="item" @click="winControl('maximize')">
                <i class="conte conte-zuidahua"></i>
            </div>
            <div class="item" @click="winControl('close')">
                <i class="conte conte-guanbi"></i>
            </div>
        </div>

        <a-drawer
            :title="$t('feed.addTitle')"
            placement="right"
            :closable="false"
            :visible="addDrawerVisible"
            :wrap-style="{ position: 'absolute' }"
            :headerStyle="{ position: 'absolute', width: '100%', zIndex: '1'}"
            :bodyStyle="{ marginTop: '60px' }"
            width="800"
            @close="closeAdd"
        >
            <div>
                <a-form-model ref="addFeedForm" :model="form" :rules="formRules" :label-col="labelCol" :wrapper-col="wrapperCol">
                    <a-form-model-item  ref="url" :label="$t('feed.form.urlTitle')" prop="url">
                        <a-input v-model="form.url" />
                    </a-form-model-item>
                    <a-form-model-item :label="$t('feed.form.proxyTitle')" prop="proxy">
                        <a-input v-model="form.proxy" />
                    </a-form-model-item>
                    <template v-if="feedPreview.length > 0">
                        <a-form-model-item label=" " :colon="false">
                            <a-list item-layout="horizontal" :data-source="feedPreview" :split="false" size="small">
                                <a-list-item class="no-flex" slot="renderItem" slot-scope="item">
                                    <template v-if="item.keyName != 'items'">
                                        <span class="text-bold margin-right-sm">{{ item.keyTitle }}: </span>
                                        {{ item.content }}
                                    </template>
                                    <template v-else>
                                        <div class="text-bold">{{ item.keyTitle }}:</div>
                                        <template v-for="(iItem,iIndex) in item.content">
                                            <div :key="iIndex">{{ iItem.title }}</div>
                                        </template>
                                    </template>
                                </a-list-item>
                            </a-list>
                        </a-form-model-item>
                    </template>
                </a-form-model>
            </div>
            <div
                :style="{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  borderTop: '1px solid #e9e9e9',
                  padding: '10px 16px',
                  background: '#fff',
                  textAlign: 'right',
                  zIndex: 1,
                }"
            >
                <a-button class="margin-right-sm" type="primary" :loading="previewLoading" @click="privewFeed">
                    {{ $t('feed.form.previewBtn') }}
                </a-button>
                <a-button type="primary" :loading="addFeedLoading" @click="addFeed">
                    {{ $t('feed.form.submitBtn') }}
                </a-button>
            </div>
        </a-drawer>
    </div>
</template>

<script>
    import { parserFeed } from "@/parser/feed"

    const electron = require('electron');
    const remote = electron.remote;

    export default {
        name: "TopBar",
        data() {
            return {
                addDrawerVisible: false,

                labelCol: { span: 6 },
                wrapperCol: { span: 14 },
                form: {
                    url: '',
                    proxy: '',
                },
                formRules: {
                    url: [
                        { required: true, message: this.$t("feed.form.rules.url"), trigger: 'blur' },
                    ]
                },
                feedPreview: [],
                addFeedLoading: false,
                previewLoading: false,
                feedList: [],
                items: [],
                detailContent: '',
                current: '',
            }
        },
        methods: {
            winControl(action) {
                const browserWindow = remote.getCurrentWindow()
                switch (action) {
                    case 'minimize':
                        browserWindow.minimize()
                        break;
                    case 'maximize':
                        if (browserWindow.isMaximized()) {
                            browserWindow.unmaximize()
                        } else {
                            if (this.isMaximized) {
                                browserWindow.unmaximize()
                            } else {
                                browserWindow.maximize()
                            }
                        }
                        this.isMaximized = !this.isMaximized
                        break;
                    case 'close':
                        browserWindow.close()
                        break;
                    default:
                        break;
                }
            },

            showAdd() {
                this.addDrawerVisible = !this.addDrawerVisible
            },
            closeAdd() {
                this.addDrawerVisible = false
                this.addReset()
            },
            //添加 Feed
            async addFeed() {
                let res = await this.$refs.addFeedForm.validate();
                if (!res) return false
                try {
                    this.addFeedLoading = true
                    let feedInfo = await parserFeed(this.form.url, {proxy: this.form.proxy})
                    console.log(feedInfo)
                    this.addFeedLoading = false
                    if (!feedInfo) {
                        this.$message.error(this.$t("message.addFail"))
                        return false
                    }
                    let url = feedInfo.feedUrl ? feedInfo.feedUrl : this.form.url

                    let existItem = await this.$nedb
                        .feeds
                        .findOne({url: url})
                    console.log(existItem)
                    if (!existItem) {
                        let res = await this.$nedb
                            .feeds
                            .insert({
                                oriUrl: this.form.url,
                                url: url,
                                title: feedInfo.title,
                                proxy: this.form.proxy,
                            })
                        res = res ? this.$t("message.addSuccess") : this.$t("message.addFail")
                        this.$message.success(res)
                    } else {
                        this.$message.success(this.$t("message.addExist"))
                    }
                    await this.getFeedList()
                } catch (e) {
                    console.log(e)
                }
            },
            //重置添加
            addReset() {
                this.$refs.addFeedForm.resetFields()
                this.form.url = ''
                this.form.proxy = ''
                this.feedPreview = []
                this.addFeedLoading = false
            },
            //获取列表
            async getFeedList() {
                try{
                    this.feedList = await this.$nedb
                        .feeds
                        .find({})
                    console.log(this.feedList)
                } catch (e) {
                    console.log(e)
                }
            },

            //预览源
            async privewFeed() {
                let res = await this.$refs.addFeedForm.validate();
                console.log(res)
                if (!res) return false
                try{
                    this.previewLoading = true
                    let feedInfo = await parserFeed(this.form.url, {proxy: this.form.proxy})
                    this.previewLoading = false
                    this.feedPreview = this.previewFormat(feedInfo)
                } catch (e) {
                    console.log(e)
                    this.previewLoading = false
                }
            },
            //预览内容格式化
            previewFormat(data) {
                const formatList = [
                    {
                        keyName: 'feedUrl',
                        keyTitle: '源地址'
                    },
                    {
                        keyName: 'title',
                        keyTitle: '名称'
                    },
                    {
                        keyName: 'description',
                        keyTitle: '描述'
                    },
                    {
                        keyName: 'webMaster',
                        keyTitle: '站长'
                    },
                    {
                        keyName: 'generator',
                        keyTitle: '生成'
                    },
                    {
                        keyName: 'link',
                        keyTitle: '链接'
                    },
                    {
                        keyName: 'language',
                        keyTitle: '语言'
                    },
                    {
                        keyName: 'lastBuildDate',
                        keyTitle: '最后构建时间'
                    },
                    {
                        keyName: 'ttl',
                        keyTitle: 'TTL'
                    },
                    {
                        keyName: 'items',
                        keyTitle: '内容',
                        content: []
                    },
                ]
                formatList.forEach((item, index) => {
                    if (item.keyName == 'items') {
                        if (data['items'].length > 0) {
                            data['items'].forEach(cItem => {
                                formatList[index].content.push({
                                    title: cItem.title
                                })
                            })
                        }
                    } else {
                        if (data[item.keyName]) {
                            formatList[index].content = data[item.keyName]
                        }
                    }
                })
                return formatList
            }
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