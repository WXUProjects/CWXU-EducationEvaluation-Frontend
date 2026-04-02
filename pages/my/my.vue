<template>
  <view class="my-container">
    <!-- 页面头部 -->
    <view class="header">
      <view class="user-info-wrapper">
        <!-- ✅ 使用可选链防止 userInfo 为 undefined 时报错 -->
        <view class="avatar">{{ userInfo?.name ? userInfo.name.charAt(0) : '?' }}</view>
        <view class="info-text">
          <text class="user-name">{{ userInfo?.name || '未登录' }}</text>
          <text class="user-student-id">{{ userInfo?.studentNo || '请登录' }}</text>
        </view>
      </view>
    </view>

    <!-- 信息区域 -->
    <view class="form-wrapper">
      <view class="form-item">
        <text class="title">个人信息</text>
      </view>

      <view class="info-item">
        <text class="info-label">姓名</text>
        <!-- ✅ 所有字段访问都加上可选链 ?. -->
        <text class="info-value">{{ userInfo?.name || '未填写' }}</text>
      </view>

      <view class="info-item">
        <text class="info-label">学号</text>
        <text class="info-value">{{ userInfo?.studentNo || '未填写' }}</text>
      </view>

      <view class="info-item">
        <text class="info-label">性别</text>
        <text class="info-value">{{ userInfo?.sex || '未填写' }}</text>
      </view>

      <!-- 退出登录按钮 -->
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 页足 -->
    <view class="footer">
      <text class="copyright">无锡学院 新西伯利亚学院 教学评价系统</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// ========== 类型定义 ==========
interface UserInfo {
  id?: string | number | null
  idCardNo?: string
  name?: string
  sex?: string
  studentNo?: string
  [key: string]: any
}

// ========== 响应式数据 ==========
// ✅ 初始化为一个空对象，确保 userInfo 永远不是 undefined
const userInfo = ref<UserInfo>({})

// ========== 工具函数 ==========
const getUserInfo = (): UserInfo => {
  try {
    const data = uni.getStorageSync('userInfo')
    // 确保返回的是对象，如果是 null/undefined 则返回空对象
    return (data && typeof data === 'object') ? data : {}
  } catch (err) {
    console.error('读取用户信息缓存失败:', err)
    return {}
  }
}

const clearLoginCache = () => {
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('stuNo')
  uni.removeStorageSync('taskId')
  // 兼容 H5 环境下的 localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('taskId')
    window.localStorage.removeItem('stuNo')
  }
}

// ========== 事件处理 ==========
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        clearLoginCache()
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => {
          // ✅ 使用 reLaunch 清除页面栈，防止退出后点击返回键回到个人页
          uni.reLaunch({ url: '/pages/login/login' })
        }, 600)
      }
    }
  })
}

// ========== 生命周期 ==========
const loadUserInfo = () => {
  const data = getUserInfo()
  
  // 如果缓存为空，说明未登录
  if (!data || Object.keys(data).length === 0) {
    // 可选：自动跳转登录页，或者保持显示“未登录”状态
    // uni.redirectTo({ url: '/pages/login/login' }) 
    userInfo.value = {} // 重置为空对象
    return
  }

  // ✅ 安全赋值：确保 userInfo 始终是一个有效的对象
  userInfo.value = {
    id: data.id ?? null,
    idCardNo: data.idCardNo ?? '',
    name: data.name ?? '',
    sex: data.sex ?? '',
    studentNo: data.studentNo ?? '',
    ...data
  }
}

onMounted(() => {
  loadUserInfo()
})

</script>

<style lang="scss">
/* 确保引入 uni.scss 以支持 $uni-xxx 变量 */
/* 如果你的项目结构不同，请调整路径，例如 @import '@/uni.scss'; */
@import '@/uni.scss'; 

.my-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #6f2b75;
  padding-bottom: env(safe-area-inset-bottom);
}

.header {
  padding: 40rpx 30rpx;
  /* #ifdef H5 */
  padding-top: calc(40rpx + var(--status-bar-height));
  /* #endif */
  display: flex;
  align-items: center;
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #6f2b75;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: bold;
  flex-shrink: 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  overflow: hidden;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  max-width: 200rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-student-id {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.form-wrapper {
  flex: 1;
  border-radius: 48rpx 48rpx 0 0;
  background: #ffffff;
  padding: 40rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.title {
  margin-left: 20rpx;
  position: relative;
  font-size: 36rpx;
  font-weight: bold;
  color: #6f2b75;
  padding-bottom: 20rpx;
}

.title::after {
  content: '';
  position: absolute;
  display: block;
  top: 0;
  left: -20rpx;
  width: 8rpx;
  height: 100%;
  background: #6f2b75;
  border-radius: 4rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.info-value {
  font-size: 30rpx;
  color: #666666;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #ffffff;
  color: #e74c3c;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 16rpx;
  border: 2rpx solid #e74c3c;
  margin-top: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
    background: #fff5f5;
  }
}

.footer {
  background-color: #ffffff;
  padding: 24rpx 0 40rpx 0;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.copyright {
  text-align: center;
  display: block;
  font-size: 24rpx;
  color: #999999;
  line-height: 1.5;
}
</style>