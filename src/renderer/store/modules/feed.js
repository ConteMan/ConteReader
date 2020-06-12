import {
    FEED_LIST,
} from '@/store/mutation-types'

const user = {
    namespaced: true,
    state: {
        list: [],
    },
    getters: {
    },
    mutations: {
        [FEED_LIST] (state, data) {
            state.list = data
        },
    },
    action: {
    }
}

export default user