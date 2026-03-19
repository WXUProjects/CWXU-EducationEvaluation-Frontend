<template>
  <view class="my-page">
    <!-- 个人信息头部 -->
    <view class="profile-header">
      <view class="avatar-container">
        <view class="avatar-placeholder">{{ userInfo.name ? userInfo.name.charAt(0) : '?' }}</view>
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.name || '未登录' }}</text>
        <text class="user-student-id">{{ userInfo.studentId || '请登录' }}</text>
      </view>
    </view>

    <!-- 信息列表 -->
    <view class="info-section">
      <uni-card :is-shadow="false" :is-full="true">
        <uni-list>
          <uni-list-item title="姓名" :rightText="userInfo.name || '未填写'"></uni-list-item>
          <uni-list-item title="学号" :rightText="userInfo.studentId || '未填写'"></uni-list-item>
          <uni-list-item title="班级" :rightText="userInfo.className || '未填写'"></uni-list-item>
        </uni-list>
      </uni-card>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
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
        name: '张三',
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
.my-page {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;

  .profile-header {
    background: linear-gradient(135deg, $uni-color-primary, $uni-color-primary-d);
    padding: $uni-spacing-col-lg * 2 $uni-spacing-col-base;
    display: flex;
    align-items: center;
    gap: $uni-spacing-row-lg;

    .avatar-container {
      .avatar-placeholder {
        width: 80px;
        height: 80px;
        border-radius: $uni-border-radius-circle;
        background-color: $uni-bg-color;
        color: $uni-color-primary;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: $uni-spacing-col-sm;

      .user-name {
        font-size: $uni-font-size-lg;
        font-weight: bold;
        color: $uni-text-color-inverse;
      }

      .user-student-id {
        font-size: $uni-font-size-base;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .info-section {
    margin-top: $uni-spacing-col-base;

    :deep(.uni-card__content) {
      padding: 0;
    }
  }

  .logout-section {
    padding: $uni-spacing-col-lg * 2 $uni-spacing-col-base;

    .logout-btn {
      width: 100%;
      height: 44px;
      background-color: $uni-bg-color;
      color: $uni-color-error;
      border: 1px solid $uni-color-error;
      border-radius: $uni-border-radius-lg;
      font-size: $uni-font-size-base;
      display: flex;
      align-items: center;
      justify-content: center;

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>
