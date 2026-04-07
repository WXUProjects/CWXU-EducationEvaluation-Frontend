import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif


uni.addInterceptor('request', {
    invoke(args) {
        const token = uni.getStorageSync('token');
        if (token) {
            args.header = {
                ...args.header,
                'Authorization': `Bearer ${token}`
            };
        }
    },
    fail(err) {
        console.error('请求拦截失败', err);
    }
});