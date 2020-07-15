<template>
    <div>
        <meta name="referrer" content="no-referrer">
        <div class="sider">
            <a-list class="feed-list" item-layout="horizontal" :data-source="feedList" :split="false">
                <a-list-item class="feed-list-item" :class="{'select-feed':  item._id == current._id}" slot="renderItem" slot-scope="item, index" :key="index" @click="getItemList(item)">
                    <a-dropdown :trigger="['contextmenu']">
                        <div class="feed-title">{{ item.title }}</div>
                        <a-menu slot="overlay">
                            <a-menu-item key="1" @click="updateFeedList(item)">
                                {{ $t("main.siderContextMenu.update") }}
                            </a-menu-item>
                            <a-menu-item key="2" @click="showEditFeed(item)">
                                {{ $t("main.siderContextMenu.edit") }}
                            </a-menu-item>
                            <a-menu-item key="3" @click="deleteFeedConfirm(item)">
                                {{ $t("main.siderContextMenu.delete") }}
                            </a-menu-item>
                        </a-menu>
                    </a-dropdown>
                </a-list-item>
            </a-list>
        </div>
        <div class="title">
            <a-list class="title-list" item-layout="horizontal" :data-source="items">
                <a-list-item class="title-list-item" :class="{'select-title': index == titleIndex[item.feed_id]}" slot="renderItem" slot-scope="item, index" :key="index" @click="getDetail(index)">
                    <div>{{ item.title }}</div>
                    <div class="time">{{ formatTime(item.publish_at, 'YYYY/MM/DD HH:mm:ss') }}</div>
                </a-list-item>
            </a-list>
        </div>
        <div class="detail">
            <template v-if="detail.content">
                <div v-html="formatContent(detail.content)"></div>
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
    import dayjs from "dayjs"
    import {getFeedList} from "@/utils/feed"
    import {mapGetters} from "vuex"

    export default {
        name: "index",
        data() {
            return {
                //feedList: [], //源列表
                items: [], //源内容列表
                detail: {}, //具体内容
                current: {
                    _id: ''
                }, //当前源
                titleIndex: {},

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
        computed: {
            ...mapGetters(
                {
                    feedList: 'feedList'
                }
            )
        },
        async mounted() {
            try{
                console.log('all: ', await this.allRecords())
                let list = await getFeedList()
                if (Object.keys(this.current).length < 2) {
                    console.log('list[0]', list[0])
                    this.current = list[0]
                    await this.getItemList(list[0])
                    this.titleIndex[list[0]._id] = 0
                    await this.getDetail(0)
                }
            } catch (e) {
                console.log(e)
            }
        },
        methods: {
            formatContent(data) {
                //微信公众号图片处理
                return data.replace(/src="https:\/\/mmbiz.qpic.cn/g, 'src="http://img02.store.sogou.com/net/a/05/link?appid=100520091&url=https://mmbiz.qpic.cn')
            },
            //从记录表获取源记录
            formatTime(time, format) {
                return dayjs.unix(time).format(format)
            },
            async getItemList(item) {
                try{
                    this.current = item
                    this.items = await this.$nedb
                        .feed_records
                        .find({feed_id: item._id}, { title: 1, guid: 1, feed_id: 1, publish_at: 1,updated_at: 1})
                        .sort({publish_at: -1})
                    if (typeof this.titleIndex[item._id] === 'undefined') this.titleIndex[item._id] = 0
                    await this.getDetail(this.titleIndex[item._id])
                    console.log(this.items)
                } catch (e) {
                    console.log(e)
                }
            },

            //获取详情
            async getDetail(index) {
                try{
                    this.titleIndex[this.items[index].feed_id] = index
                    this.titleIndex = {...this.titleIndex}
                    let id = typeof this.items[index] === 'undefined' ? '' : this.items[index]._id
                    if(id) {
                        if(id == this.detail._id) {
                            return false
                        }
                        this.detail = await this.$nedb
                            .feed_records
                            .findOne({_id:id})
                            .sort({created_at: -1})
                    } else {
                        this.detail = ''
                        this.$message.error(this.$t('feed.detailFail'))
                    }
                } catch (e) {
                    console.log(e)
                }
            },

             //获取并更新源数据
            async updateFeedList(current) {
                try{
                    let options = {
                        proxy: current.proxy ? current.proxy : ''
                    }
                    let feedInfo = await this.$feed.parserFeed(current.url, options)
                    console.log(feedInfo)
                    let count = 0
                    if (feedInfo && feedInfo.items.length > 0) {
                        for(let index = 0; index < feedInfo.items.length; index++) {
                            let item = feedInfo.items[index]
                            console.log('item', item)
                            let guid = item.guid ? item.guid : item.id
                            if (typeof(guid) != 'string') continue
                            let existItem = await this.$nedb
                                .feed_records
                                .findOne({guid_md5: this.$md5(String(guid))})
                            console.log('existItem: ', existItem)
                            if(!existItem) {
                                let res = await this.$nedb
                                    .feed_records
                                    .insert(
                                    {
                                        feed_id: current._id,
                                        title: item.title,
                                        guid: guid,
                                        guid_md5: this.$md5(String(guid)),
                                        link: item.link,
                                        content: item.content,
                                        content_snippet: item.content_snippet,
                                        publish_at: item.pubDate ? dayjs(item.pubDate).unix() : dayjs().unix(),
                                        created_at: dayjs().unix(),
                                        updated_at: dayjs().unix(),
                                        deleted_at: 0
                                    }
                                )
                                if(res) count++;
                            }
                        }
                    }
                    console.log(count)
                    if (count > 0) {
                        await this.getItemList(current)
                    }
                    this.$message.info(this.$t('feed.updateSuccess', { count: count }))
                } catch (e) {
                    console.log(e)
                }
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
                    let feedInfo = await this.$feed.parserFeed(this.editFeedForm.url, {proxy: this.editFeedForm.proxy})
                    let url = feedInfo.feedUrl ? feedInfo.feedUrl : this.editFeedForm.url
                    let editRes = await this.$nedb
                        .feeds
                        .update({_id: this.current._id},{
                            oriUrl: this.editFeedForm.url,
                            url: url,
                            title: feedInfo.title,
                            proxy: this.editFeedForm.proxy,
                            updated_at: dayjs().unix(),
                        })
                    await getFeedList()
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
            deleteFeedConfirm(item) {
                var _this = this
                 this.$confirm({
                    title: _this.$t('main.siderContextMenu.delete'),
                    content: _this.$t('feed.deleteConfirm', { title: item.title }),
                    onOk() {
                        _this.deleteFeed(item)
                        _this.$message.success(_this.$t('message.deleteSuccess'))
                    },
                    onCancel() {},
                })
            },
            async deleteFeed(item) {
                try{
                    let feedRes = await this.$nedb
                        .feeds
                        .remove({_id: item._id},{ multi: true })
                    let recordRes = await this.$nedb
                        .feed_records
                        .remove({feed_id: item._id}, { multi: true })
                    let list = await getFeedList()
                    if (item._id == this.current._id) {
                        this.current = list[0]
                        await this.getItemList(list[0])
                        this.currentTitleIndex = 0
                        await this.getDetail(this.currentTitleIndex)
                    }
                    return feedRes && recordRes
                } catch (e) {
                    console.log(e)
                }
            },
            async allRecords() {
                try {
                    return await this.$nedb
                        .feed_records
                        .find({})
                } catch (e) {
                    console.log(e)
                }
            },
        }
    }
</script>

<style lang="less" scoped>
        .sider,.title,.detail {
            display: inline-block;
            height: 100%;
        }
        .title {
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
        .title {
            position: fixed;
            margin-left: 200px;
            background: #F7F6F3;
            width: 260px;
            .title-list {
                .title-list-item {
                    cursor: pointer;
                    padding-left: 10px;
                    padding-right: 10px;
                    display: block;
                    .time {
                        text-align: left;
                        font-size: 12px;
                    }
                }
                .title-list-item:last-child {
                    margin-bottom: 50px;
                }
            }
        }
        .detail {
            margin-left: 460px;
            padding: 10px 20px;
            width: calc(100% - 460px);
            display: flex;
            flex-direction: row;
            justify-content: center;
            /deep/ #js_content {
                visibility: visible !important;
            }
            /deep/ img {
                max-width: 100%;
            }
        }
        .detail > div {
            max-width: 850px;
        }
        .select-feed {
            background: darkgrey;
        }
        .select-title {
            background: grey;
            color: #fff;
        }
</style>
