// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import MyServerHttp from '@/plugins/http.js'
import moment from 'moment'
// elementUi css
import 'element-ui/lib/theme-chalk/index.css'

import '@/assets/css/reset.css'
import router from './router'

//适用vue插件
Vue.use(MyServerHttp)
Vue.use(ElementUI)

Vue.config.productionTip = false

//全局过滤器
Vue.filter('fmtdate',(v)=>{
  return moment(v).format('YYYY-MM-DD')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
