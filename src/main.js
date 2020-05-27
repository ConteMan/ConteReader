import Vue from 'vue'
import App from './renderer/App.vue'
import router from './renderer/router'
import store from './renderer/store'
import db from './universal/db'
import i18n from './renderer/lang'

import 'ant-design-vue/dist/antd.css';

import '@/core/lazy_use'

Vue.config.productionTip = false

Vue.prototype.$db = db

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
