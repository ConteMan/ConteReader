import { remote } from 'electron'
const nedb = remote.getGlobal('nedb')

import store from '@/store'

async function getFeedList() {
    try{
        let list = await nedb.feeds.find({})
        await store.commit('feed/FEED_LIST', list)
        return list
    } catch (e) {
        console.log('getFeedList:', e)
        return []
    }
}

export {
    getFeedList
}