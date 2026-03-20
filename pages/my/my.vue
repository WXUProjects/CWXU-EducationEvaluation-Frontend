<template>
  <view class="my-container">
    <!-- 页面头部 -->
    <view class="header">
      <view class="user-info-wrapper">
        <view class="avatar">{{ userInfo.name ? userInfo.name.charAt(0) : '?' }}</view>
        <view class="info-text">
          <text class="user-name">{{ userInfo.name || '未登录' }}</text>
          <text class="user-student-id">{{ userInfo.studentId || '请登录' }}</text>
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
        <text class="info-value">{{ userInfo.name || '未填写' }}</text>
      </view>

      <view class="info-item">
        <text class="info-label">学号</text>
        <text class="info-value">{{ userInfo.studentId || '未填写' }}</text>
      </view>

      <view class="info-item">
        <text class="info-label">班级</text>
        <text class="info-value">{{ userInfo.className || '未填写' }}</text>
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

<script setup>
import { ref, onMounted } from 'vue';

const userInfo = ref({
  name: '',
  studentId: '',
  className: ''
});

const mockFetchUserInfo = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: '李明',
        studentId: '2021001001',
        className: '计算机科学与技术1班'
      });
    }, 500);
  });
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已退出登录', icon: 'none' });
      }
    }
  });
};

onMounted(async () => {
  try {
    const data = await mockFetchUserInfo();
    userInfo.value = data;
  } catch (error) {
    console.error('加载用户信息失败:', error);
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});
</script>

<style lang="scss">
.my-container {
  display: flex;
  flex-direction: column;
  min-height: 94vh;
  background: #6f2b75;
}

.header {
  padding: $uni-spacing-col-lg * 2;
  display: flex;
  align-items: center;
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  gap: $uni-spacing-row-lg;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: $uni-border-radius-circle;
  background: $uni-bg-color;
  color: #6f2b75;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: bold;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-col-sm;
}

.user-name {
  font-size: $uni-font-size-lg + 4px;
  font-weight: bold;
  color: $uni-text-color-inverse;
}

.user-student-id {
  font-size: $uni-font-size-base;
  color: rgba(255, 255, 255, 0.9);
}

.form-wrapper {
  flex: 1;
  border-radius: 48rpx 48rpx 0 0;
  background: $uni-bg-color;
  padding: $uni-spacing-col-lg * 2;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
}

.title {
  margin-left: 20rpx;
  position: relative;
  font-size: $uni-font-size-title;
  font-weight: bold;
  color: #6f2b75;
}

.title::after {
  content: '';
  position: absolute;
  display: block;
  top: 0;
  left: -20rpx;
  width: 10rpx;
  height: 100%;
  background: #6f2b75;
}

.form-item {
  margin-bottom: $uni-spacing-col-lg;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-spacing-col-base 0;
  border-bottom: 1px solid $uni-border-color;
}

.info-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.info-value {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-spacing-col-base * 1.2 0;
  border-bottom: 1px solid $uni-border-color;
}

.option-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.option-arrow {
  font-size: 40rpx;
  color: $uni-text-color-grey;
  font-weight: 300;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: $uni-bg-color;
  color: $uni-color-error;
  font-size: $uni-font-size-lg;
  border-radius: $uni-border-radius-lg;
  border: 1px solid $uni-color-error;
  margin-top: $uni-spacing-col-lg * 2;

  &:active {
    opacity: 0.9;
  }
}

.footer {
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-base 0 $uni-spacing-col-lg * 2 0;
}

.copyright {
  text-align: center;
  display: block;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}
</style>
