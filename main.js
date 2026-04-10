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

// ========== 请求拦截器 ==========
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

// ========== 响应拦截器==========
uni.addInterceptor('request', {
  success(res) {
    const data = res.data || {};
    if (data.code === 401 || data.code === 'TOKEN_EXPIRED') {
      handleTokenExpired();
      return false;
    }
    
    if (res.statusCode === 401) {
      handleTokenExpired();
      return false;
    }
    
    return true; // 放行响应
  },
  fail(err) {
    if (err.statusCode === 401) {
      handleTokenExpired();
    }
    console.error('请求响应失败', err);
  }
});

// ========== Token 过期统一处理函数 ==========
function handleTokenExpired() {
  console.warn('Token 已过期，正在清理登录状态...');
  
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  uni.removeStorageSync("taskId")
  
  uni.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  });
  
  setTimeout(() => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const redirectUrl = currentPage ? `/${currentPage.route}` : '/pages/index/index';
    
    uni.reLaunch({
      url: `/pages/login/login?redirect=${encodeURIComponent(redirectUrl)}`
    });
  }, 1500);
}