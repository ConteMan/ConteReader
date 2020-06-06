<template>
    <div>
        <div class="sider">
            <a-list class="feed-list" item-layout="horizontal" :data-source="feedList" :split="false">
                <a-list-item class="feed-list-item" slot="renderItem" slot-scope="item, index" :key="index" @click="getItemList(item)">
                    <a-dropdown :trigger="['contextmenu']">
                        <div class="feed-title">{{ item.title }}</div>
                        <a-menu slot="overlay">
                            <a-menu-item key="1" @click="updateFeedList(item)">
                                {{ $t("main.siderContextMenu.update") }}
                            </a-menu-item>
                            <a-menu-item key="2" @click="showEditFeed(item)">
                                {{ $t("main.siderContextMenu.edit") }}
                            </a-menu-item>
                            <a-menu-item key="3" @click="deleteFeed(item)">
                                {{ $t("main.siderContextMenu.delete") }}
                            </a-menu-item>
                        </a-menu>
                    </a-dropdown>
                </a-list-item>
            </a-list>
        </div>
        <div class="title">
            <a-list class="title-list" item-layout="horizontal" :data-source="items">
                <a-list-item class="title-list-item" slot="renderItem" slot-scope="item, index" :key="index" @click="getDetail(index)">
                    {{ item.title }}
                </a-list-item>
            </a-list>
        </div>
        <div class="detail">
            <template v-if="detail.content">
                <div v-html="detail.content"></div>
            </template>
            <div v-else>
                {{ detail.title }}
            </div>
        </div>

        <a-drawer
            :title="$t('feed.editTitle')"
            placement="right"
            width="800"
            :closable="false"
            :visible="editFeedVisible"
            :wrap-style="{ position: 'absolute' }"
            @close="closeEditFeed"
        >
            <div>
                <a-form-model ref="editFeedForm" :model="editFeedForm" :label-col="editLayout.labelCol" :wrapper-col="editLayout.wrapperCol" :rules="editFeedRules">
                    <a-form-model-item :label="$t('feed.form.urlTitle')" prop="url">
                        <a-input v-model="editFeedForm.url" />
                    </a-form-model-item>
                    <a-form-model-item :label="$t('feed.form.proxyTitle')" prop="proxy">
                        <a-input v-model="editFeedForm.proxy" />
                    </a-form-model-item>
                    <a-form-model-item v-if="editFeedPreview" :label="$t('feed.form.previewTitle')">
                        {{ editFeedPreview }}
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
                <a-button type="primary" :loading="editFeedLoading" @click="editFeed">
                    {{ $t('feed.form.saveBtn') }}
                </a-button>
            </div>
        </a-drawer>
    </div>
</template>

<script>
    import {parserFeed} from "@/parser/feed"
    import dayjs from "dayjs"

    export default {
        name: "index",
        data() {
            return {
                feedList: [], //源列表
                items: [], //源内容列表
                detail: '', //具体内容
                current: '', //当前源

                editInfo: {}, //编辑的内容
                editFeedVisible: false,
                editFeedLoading: false,
                editLayout: {
                    labelCol: { span: 6 },
                    wrapperCol: { span: 14 }
                },
                editFeedRules: {
                    url: [
                        { required: true, message: this.$t("feed.form.rules.url"), trigger: 'blur' },
                    ]
                },
                editFeedForm: {},
                editFeedPreview: ''

            }
        },
        mounted() {
            this.getFeedList()
        },
        methods: {
            //源列表
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
            //从记录表获取源记录
            async getItemList(item) {
                this.items = await this.$nedb
                    .feed_records
                    .find({feed_id: item._id})
                    .sort({created_at: -1})
            },
            //获取详情
            getDetail(index) {
                this.detail = this.items[index]
            },

             //获取并更新源数据
            async updateFeedList(current) {
                try{
                    let options = {
                        proxy: current.proxy ? current.proxy : ''
                    }
                    let feedInfo = await parserFeed(current.url, options)
                    let count = 0
                    if (feedInfo) {
                        for(let index in feedInfo.items) {
                            let item = feedInfo.items[index]
                            let existItem = await this.$nedb
                                .feed_records
                                .findOne({guid: item.guid})
                            if(!existItem) {
                                count++;
                                await this.$nedb
                                    .feed_records
                                    .insert(
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
            //提示
            openNotificationWithIcon(type, message, des) {
                this.$notification[type]({
                    message: message,
                    description: des
                });
            },

            //编辑源
            //打开编辑窗口
            async showEditFeed(item) {
                this.editFeedForm = await this.getFeedInfo(item)
                this.editFeedVisible = true
                this.current = item
            },
            //获取源信息
            getFeedInfo(item) {
                return this.$nedb.feeds.findOne({_id: item._id})
            },
            //关闭编辑窗口
            closeEditFeed() {
                this.editFeedVisible = false
            },
            //保存编辑信息
            async editFeed() {
                let res = await this.$refs.editFeedForm.validate();
                if (!res) return false
                try{
                    this.editFeedLoading = true
                    let feedInfo = await parserFeed(this.editFeedForm.url, {proxy: this.editFeedForm.proxy})
                    console.log(feedInfo)
                    let url = feedInfo.feedUrl ? feedInfo.feedUrl : this.editFeedForm.url
                    let editRes = await this.$nedb
                        .feeds
                        .update({_id: this.current._id},{
                            oriUrl: this.editFeedForm.url,
                            url: url,
                            title: feedInfo.title,
                            proxy: this.editFeedForm.proxy,
                        })
                    console.log(editRes)
                    let msg = editRes ? this.$t("message.editSuccess") : this.$t("message.editFail")
                    this.$message.success(msg)
                    this.editFeedLoading = false
                } catch (e) {
                    this.editFeedLoading = false
                    this.$message.error(e)
                    console.log(e)
                }
            },
            //删除 feed
            deleteFeed(item) {
                console.log(item)
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