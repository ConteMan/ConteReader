import Vue from 'vue'
import App from './renderer/App.vue'
import router from './renderer/router'
import store from './renderer/store'
import i18n from './renderer/lang'
import { remote } from 'electron'

import 'ant-design-vue/dist/antd.css';
import './renderer/style/index.less'

import '@/core/lazy_use'
import md5 from 'js-md5'

Vue.config.productionTip = false

Vue.prototype.$nedb = remote.getGlobal('nedb')
Vue.prototype.$feed = remote.getGlobal('feed')
Vue.prototype.$md5 = md5

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')