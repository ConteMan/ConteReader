<template>
      <div class="container">
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
            </div>
            <div class="content">
                <div class="sider">
                    <a-list class="feed-list" item-layout="horizontal" :data-source="feedList" :split="false">
                        <a-list-item class="feed-list-item" slot="renderItem" slot-scope="item, index" :key="index" @click="getTitleList(item)">
                            <a-dropdown :trigger="['contextmenu']">
                                <div class="feed-title">{{ item.title }}</div>
                                <a-menu slot="overlay">
                                    <a-menu-item key="1" @click="queryFeedList(item)">
                                        更新
                                    </a-menu-item>
                                </a-menu>
                            </a-dropdown>
                        </a-list-item>
                    </a-list>
                </div>
                <div class="title">
                    <a-list class="title-list" item-layout="horizontal" :data-source="items">
                        <a-list-item class="title-list-item" slot="renderItem" slot-scope="item, index" :key="index" @click="getDetailContent(index)">
                            {{ item.title }}
                        </a-list-item>
                    </a-list>
                </div>
                <div class="detail">
                    <template v-if="detailContent.content">
                        <div v-html="detailContent.content"></div>
                    </template>
                    <div v-else>
                        {{ detailContent.title }}
                    </div>
                </div>
            </div>

            <a-drawer
              :title="$t('feed.addTitle')"
              placement="right"
              :closable="false"
              :visible="addDrawerVisible"
              :wrap-style="{ position: 'absolute' }"
              width="800"
              @close="onClose"
            >
                <div>
                    <a-form-model ref="addFeedForm" :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
                        <a-form-model-item :label="$t('feed.form.urlTitle')">
                            <a-input v-model="form.url" />
                        </a-form-model-item>
                        <a-form-model-item :label="$t('feed.form.proxyTitle')">
                            <a-input v-model="form.proxy" />
                        </a-form-model-item>
                        <a-form-model-item v-if="feedPreview" :label="$t('feed.form.previewTitle')">
                            {{ feedPreview }}
                        </a-form-model-item>
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
                    <a-button type="primary" :loading="addFeedLoading" @click="addFeed">
                        {{ $t('feed.form.submitBtn') }}
                    </a-button>
                </div>
            </a-drawer>

      </div>
</template>

<script>
const electron = require('electron');
const remote = electron.remote;

import dayjs from 'dayjs'
import { parserFeed } from "../parser/feed.js"

export default {
    name: 'Home',
    components: {
    },
    data() {
        return {
            addDrawerVisible: false,

            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
            form: {
                url: '',
                proxy: '',
            },
            feedPreview: '',
            addFeedLoading: false,
            feedList: [],
            items: [],
            detailContent: '',
            current: '',
        }
    },
    methods: {
        winControl(action) {
            console.log(action)
            const browserWindow = remote.getCurrentWindow()
            switch (action) {
                case 'minimize':
                    browserWindow.minimize()
                    break;
                case 'maximize':
                    // if (this.isMaximized) {
                    if (browserWindow.isMaximized()) {
                        browserWindow.unmaximize()
                    } else {
                        if (this.isMaximized) {
                            browserWindow.unmaximize()
                        } else {
                            browserWindow.maximize()
                        }
                    }
                    // this.isMaximized = browserWindow.isMaximized()
                    this.isMaximized = !this.isMaximized
                    break;
                case 'close':
                    browserWindow.close()
                    break;
                default:
                    break;
            }
        },
        onClose() {
            this.addDrawerVisible = false
            this.addReset()
        },
        showAdd() {
            this.addDrawerVisible = !this.addDrawerVisible
        },
        //添加 Feed
        async addFeed() {
            try {
                // console.log(this.form)
                // console.log(res)
                this.addFeedLoading = true
                console.log('start ')
                let feedInfo = await parserFeed(this.form.url, {proxy: this.form.proxy})
                console.log(feedInfo)
                this.addFeedLoading = false
                if (!feedInfo) {
                    this.$message.error(this.$t("message.addFail"))
                    return false
                }
                this.feedPreview = feedInfo.title
                console.log(feedInfo)
                let url = feedInfo.feedUrl ? feedInfo.feedUrl : this.form.url

                console.log(this.$nedb.feeds)
                let existItem = await this.$nedb.feeds.findOne({url: url})
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
                    await this.$message.success(res)
                } else {
                    await this.$message.success(this.$t("message.addExist"))
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
            this.feedPreview = ''
            this.addFeedLoading = false
        },
        //FeedList
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
        //获取列表
        async getTitleList(item) {
            this.items = await this.$nedb.feed_records.find({feed_id: item._id}).sort({created_at: -1})
        },
        //获取详情
        getDetailContent(index) {
            this.detailContent = this.items[index]
        },
        //更新
        async queryFeedList(current) {
            try{
                let options = {
                    proxy: current.proxy ? current.proxy : ''
                }
                let feedInfo = await parserFeed(current.url, options)
                let count = 0
                if (feedInfo) {
                    for(let index in feedInfo.items) {
                        let item = feedInfo.items[index]
                        let existItem = await this.$nedb.feed_records.findOne({guid: item.guid})
                        if(!existItem) {
                            count++;
                            await this.$nedb.feed_records.insert(
                                {
                                    feed_id: current._id,
                                    title: item.title,
                                    guid: item.guid,
                                    link: item.link,
                                    content: item.content,
                                    content_snippet: item.content_snippet,
                                    publish_at: item.pubDate ? item.pubDate : '',
                                    created_at: dayjs().second(),
                                    updated_at: dayjs().second(),
                                    deleted_at: 0
                                }
                            )
                        }
                    }
                }
                this.openNotificationWithIcon('success', '更新成功'+count+'条')
            } catch (e) {
                console.log(e)
            }
        },
        openNotificationWithIcon(type, message, des) {
            this.$notification[type]({
                message: message,
                description: des
            });
        },
    },
    mounted() {
        this.getFeedList()
    },
    async created() {
    }
}
</script>

<style lang="less">
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