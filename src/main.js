// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import MyServerHttp from '@/plugins/http.js'

// elementUi css
import 'element-ui/lib/theme-chalk/index.css'

import '@/assets/css/reset.css'
import router from './router'

//适用vue插件
Vue.use(MyServerHttp)
Vue.use(ElementUI)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
