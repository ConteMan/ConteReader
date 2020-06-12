import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

import zh_CN from './zh_CN'
import en from './en'

const messages = {
    'zh_CN': zh_CN,
    'en': en,
}

export default new VueI18n({
    locale: 'zh_CN', // 设置地区
    messages, // 设置地区信息
})