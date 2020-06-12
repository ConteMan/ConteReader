<template>
    <div class="header">
        <div class="logo">Conte Reader</div>
        <div class="operate">
            <div class="item" @click="getAFeedList">
                <i class="conte conte-home"></i>
            </div>
            <div class="item" @click="showAdd">
                <i class="conte conte-appstoreadd"></i>
            </div>
<!--            <div class="item">-->
<!--                <i class="conte conte-setting"></i>-->
<!--            </div>-->
<!--            <div class="item">-->
<!--                <i class="conte conte-sync"></i>-->
<!--            </div>-->
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
                                            <span class="text-bold margin-right-sm" :title="item.keyName">{{ item.keyTitle }}: </span>
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
    import { getFeedList } from "@/utils/feed"
    import dayjs from "dayjs"

    const electron = require('electron');
    const { remote } = electron;

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
        computed: {
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

            getAFeedList() {
                return getFeedList()
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
                    let feedInfo = await this.$feed.parserFeed(this.form.url, {proxy: this.form.proxy})
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
                    if (!existItem) {
                        let res = await this.$nedb
                            .feeds
                            .insert({
                                oriUrl: this.form.url,
                                url: url,
                                title: feedInfo.title,
                                proxy: this.form.proxy,
                            })
                        console.log(res)
                        if(!res) {
                            this.$message.error(this.$t("message.addFail"))
                            return false
                        }
                        const feedId = res._id
                        //更新源数据
                        if (feedInfo && feedInfo.items.length > 0) {
                            for(let index = 0; index < feedInfo.items.length; index++) {
                                let item = feedInfo.items[index]
                                if (typeof(item.guid) != 'string') continue
                                let existItem = await this.$nedb
                                    .feed_records
                                    .findOne({guid_md5: this.$md5(String(item.guid))})
                                if(!existItem) {
                                    await this.$nedb
                                        .feed_records
                                        .insert(
                                            {
                                                feed_id: feedId,
                                                title: item.title,
                                                guid: item.guid,
                                                guid_md5: this.$md5(String(item.guid)),
                                                link: item.link,
                                                content: item.content,
                                                content_snippet: item.content_snippet,
                                                publish_at: item.pubDate ? item.pubDate : '',
                                                created_at: dayjs().unix(),
                                                updated_at: dayjs().unix(),
                                                deleted_at: 0
                                            }
                                        )
                                }
                            }
                        }
                        this.$message.success(this.$t("message.addSuccess"))
                    } else {
                        this.$message.success(this.$t("message.addExist"))
                    }
                    this.closeAdd()
                    await getFeedList()
                } catch (e) {
                    console.log(e)
                    this.$message.error(this.$t("message.feedFail"))
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

            //预览源
            async privewFeed() {
                let res = await this.$refs.addFeedForm.validate();
                if (!res) return false
                try{
                    this.previewLoading = true
                    let feedInfo = await this.$feed.parserFeed(this.form.url, {proxy: this.form.proxy})
                    this.previewLoading = false
                    this.feedPreview = this.previewFormat(feedInfo)
                } catch (e) {
                    console.log(e)
                    this.previewLoading = false
                    this.$message.error(this.$t("message.feedFail"))
                }
            },
            //预览内容格式化
            previewFormat(data) {
                const formatList = [
                    {
                        keyName: 'feedUrl',
                        keyTitle: '源地址',
                        require: false,
                    },
                    {
                        keyName: 'title',
                        keyTitle: '名称',
                        require: true,
                    },
                    {
                        keyName: 'description',
                        keyTitle: '描述',
                        require: true,
                    },
                    {
                        keyName: 'webMaster',
                        keyTitle: '站长'
                    },
                    {
                        keyName: 'generator',
                        keyTitle: '生成',
                        require: true,
                    },
                    {
                        keyName: 'docs',
                        keyTitle: '文档',
                        require: false,
                    },
                    {
                        keyName: 'link',
                        keyTitle: '链接',
                        require: true,
                    },
                    {
                        keyName: 'language',
                        keyTitle: '语言',
                        require: true,
                    },
                    {
                        keyName: 'lastBuildDate',
                        keyTitle: '最后构建时间',
                        require: true,
                    },
                    {
                        keyName: 'ttl',
                        keyTitle: 'TTL',
                    },
                    {
                        keyName: 'copyright',
                        keyTitle: '版权',
                    },
                    {
                        keyName: 'items',
                        keyTitle: '内容',
                        require: true,
                        content: []
                    },
                ]
                let returnList = []
                formatList.forEach((item) => {
                    let current = {
                        keyName: item.keyName,
                        keyTitle: item.keyTitle,
                    }
                    if (item.keyName == 'items') {
                        current.content = []
                        if (data['items'].length > 0) {
                            data['items'].forEach(cItem => {
                                current.content.push({
                                    title: cItem.title
                                })
                            })
                        }
                    } else {
                        if (data[item.keyName]) {
                            current.content = data[item.keyName]
                        }
                    }
                    if(item.require || current.content) {
                        returnList.push(current)
                    }
                })
                return returnList
            }
        }
    }
</script>

<style lang="less" scoped>
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
</style>