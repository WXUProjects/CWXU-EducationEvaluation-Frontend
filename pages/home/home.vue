<template>
  <view class="home-container">
    <!-- 页面头部 -->
    <view class="header">
      <!--右上角"我的"入口 -->
      <view class="user-entry" @click="goToMy" hover-class="user-entry-hover" :hover-stay-time="150">
        <view class="avatar-small">
          {{ userInfo?.nickname?.charAt(0) || '我' }}
        </view>
        <!-- 未登录时显示小圆点提示 -->
        <view v-if="!isLoggedIn" class="login-tip"></view>
      </view>
      
      <text class="page-title">课程评价中心</text>
      <text class="page-desc">请选择课程</text>
    </view>

    <!-- 课程列表区域 -->
    <view class="form-wrapper">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <uni-load-more :contentText="{contentdown: '加载中...'}" :show="true"></uni-load-more>
      </view>

      <!-- 课程列表 -->
      <view v-else class="course-list">
        <view 
          v-for="course in courses" 
          :key="course.id" 
          class="course-card"
          :class="{ 'expanded': course.isOpen }"
        >
          <!-- 课程头部 -->
          <view 
            class="course-header" 
            @click="toggleCourse(course)"
            hover-class="course-header-hover"
            :hover-stay-time="150"
          >
            <view class="course-info">
              <text class="course-title">{{ course.name }}</text>
              
              <!-- 三个统计数据 -->
              <view class="course-stats">
                <view class="stat-item">
                  <view class="stat-icon"><uni-icons type="person-filled" size="17"></uni-icons></view>
                  <text class="stat-value">{{ course.teacher.length }}</text>
                  <text class="stat-label">位教师</text>
                </view>
                <view class="stat-item success">
                  <view class="stat-icon"><uni-icons type="checkbox" size="17"></uni-icons></view>
                  <text class="stat-value">{{ course.evaluated }}</text>
                  <text class="stat-label">已评价</text>
                </view>
                <view class="stat-item warning">
                  <view class="stat-icon"><uni-icons type="close" size="17"></uni-icons></view>
                  <text class="stat-value">{{ course.pending }}</text>
                  <text class="stat-label">待评价</text>
                </view>
              </view>
            </view>
            
            <!-- 展开箭头 -->
            <view class="toggle-icon" :class="{ 'rotate': course.isOpen }">
              <uni-icons type="down" size="14"></uni-icons>
            </view>
          </view>

          <!-- 老师列表 -->
          <view class="teacher-list-wrapper" :class="{ 'show': course.isOpen }">
            <view 
              class="teacher-item" 
              v-for="teacher in course.teacher" 
              :key="teacher.id"
            >
              <view class="teacher-profile">
                <view class="avatar-placeholder">{{ teacher.name.charAt(1) }}</view>
                <text class="teacher-name">{{ teacher.name }}</text>
              </view>
              
              <view class="action-area">
                  <button 
                    class="eval-btn" 
                    :class="{ 'evaluated': teacher.hasEvaluation }"
                    @click.stop="handleEvaluate(teacher, course)"
                    :disabled="teacher.hasEvaluation"
                    hover-class="btn-hover"
                    :hover-stay-time="100"
                  >
                    <view v-if="teacher.hasEvaluation" class="btn-content evaluated">
                      <text class="icon-check absolute-icon">✓</text>
                      <text class="btn-label">已评价</text>
                    </view>
                    
                    <text v-else class="btn-content normal">去评价</text>
                  </button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="!loading && courses.length === 0" class="empty-tip">
        <text>暂无可评价的课程</text>
      </view>
    </view>

    <!-- 页足 -->
    <view class="footer">
      <text class="copyright">无锡学院 新西伯利亚学院 教学评价系统</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const courses = ref([]);
const userInfo = ref(null);
const isLoggedIn = ref(false);

const get_stu_task_list = (stuNumber, taskId) => {
	return uni.request({
		url:`/api/v1/task/student_task_detail?stuNo=${stuNumber}&taskId=${taskId}`,
		method: "GET",
	})
}

const addIsOpen = (courses) => {
  courses.forEach((course) => {
    course.isOpen = false
  })
}

// 计算每个课程的统计信息
const computeCourseStats = (course) => {
  const total = course.teacher.length;
  const evaluated = course.teacher.filter(t => t.hasEvaluation).length;
  return {
    total,
    evaluated,
    pending: total - evaluated
  };
};

const checkLogin = () => {
  const taskId = localStorage.getItem("taskId")
  const user = uni.getStorageSync("userInfo");
  if (user && taskId) {
    isLoggedIn.value = true;
    userInfo.value = typeof user === 'string' ? JSON.parse(user) : user;
  }
};

const goToMy = () => {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' });
    }, 1200);
    return;
  }
  uni.navigateTo({ url: '/pages/my/my' });
};

// 页面加载
onMounted(async () => {	
  checkLogin();
  
  try {
	const taskId = localStorage.getItem("taskId")
	const user = uni.getStorageSync("userInfo");
    const data = await get_stu_task_list(user.studentNo, taskId);
	const coursesData = data.data.course
    courses.value = coursesData.map(course => ({
      ...course,
      ...computeCourseStats(course)
    }));
    addIsOpen(courses.value)
  } catch (error) {
    console.error('加载课程失败:', error);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
});

// 展开/收起课程
const toggleCourse = (course) => {
  course.isOpen = !course.isOpen;
};

// 处理评价操作
const handleEvaluate = (teacher, course) => {
  if (teacher.isEvaluated) return;
  
  uni.navigateTo({
    url: `/pages/evaluate/evaluate?teacherName=${encodeURIComponent(teacher.name)}&courseName=${encodeURIComponent(course.name)}`
  });
};
</script>

<style lang="scss">
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 94vh;
  background: #6f2b75;
}

.header {
  padding: 40rpx;
  text-align: center;
  position: relative; // 🔹 为绝对定位做准备
}

/* 🔹 新增：右上角用户入口样式 */
.user-entry {
  position: absolute;
  top: 28rpx;
  right: 40rpx;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .avatar-small {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    font-weight: 600;
    border: 2rpx solid rgba(255, 255, 255, 0.4);
    transition: all 0.2s;
  }
  
  .login-tip {
    position: absolute;
    top: 0;
    right: 0;
    width: 16rpx;
    height: 16rpx;
    background: #ff6b6b;
    border-radius: 50%;
    border: 2rpx solid #6f2b75;
    animation: pulse 2s infinite;
  }
}

.user-entry-hover .avatar-small {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 12rpx;
}

.page-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

.form-wrapper {
  flex: 1;
  border-radius: 48rpx 48rpx 0 0;
  background: #ffffff;
  padding: 40rpx;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
}

.loading-state,
.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #999999;
  font-size: 28rpx;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.course-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  border: 1px solid #e0e0e0;

  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24rpx 32rpx;
    background-color: #ffffff;
    position: relative;

    .course-info {
      flex: 1;
      margin-right: 20rpx;
    }

    .course-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 16rpx;
      line-height: 1.4;
      display: block;
    }

    .course-stats {
      display: flex;
      gap: 32rpx;
      margin-top: 8rpx;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 24rpx;
      color: #999999;

      &.success {
        .stat-value { color: #4cd964; }
      }
      &.warning {
        .stat-value { color: #ff9900; }
      }
    }

    .stat-icon {
      display: flex;
      align-items: center;
      color: #999999;
      line-height: 1;
    }

    .stat-value {
      font-weight: bold;
      color: #333333;
      font-size: 28rpx;
    }

    .stat-label {
      font-size: 24rpx;
    }

    .toggle-icon {
      color: #999999;
      display: flex;
      align-items: center;
      transition: transform 0.2s;
      padding-top: 4rpx;
      
      &.rotate {
        transform: rotate(180deg);
      }
    }
  }

  &.expanded {
    .course-header {
      border-bottom: 1px solid #e0e0e0;
      background-color: #f8f8f8;
    }
  }

  .teacher-list-wrapper {
    overflow: hidden;
    transition: all 0.3s ease;
    background-color: #f8f8f8;
    max-height: 0;

    &.show {
      padding: 24rpx 32rpx;
      max-height: 1000rpx;
    }
  }

  .teacher-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1px solid #e0e0e0;

    &:last-child {
      border-bottom: none;
    }

    .teacher-profile {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .avatar-placeholder {
        width: 52rpx;
        height: 52rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #6f2b75, #8e3d95);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: bold;
        flex-shrink: 0;
      }

      .teacher-name {
        font-size: 28rpx;
        color: #333333;
      }
    }

    .action-area {
      flex-shrink: 0;
      margin-left: 20rpx;
    }

    .eval-btn {
      width: 140rpx;
      height: 64rpx;
      
      justify-content: center;
      align-items: center;
      padding: 0;
      
      border-radius: 12rpx;
      font-size: 24rpx;
      font-weight: normal;
      display: flex;
      border: none;
      line-height: 1;
      flex-shrink: 0;
      position: relative;

      &:not(.evaluated):not(:disabled) {
        background-color: #6f2b75;
        color: #ffffff;
      }

      &.evaluated,
      &:disabled {
        background-color: #f1f1f1;
        color: #4cd964;
        border: 1px solid #4cd964;
        opacity: 0.7;
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: relative;
        
        &.evaluated {
          .absolute-icon {
            position: absolute;
            left: 16rpx;
            font-weight: bold;
            font-size: 24rpx;
          }
          .btn-label {
            margin-left: 0;
          }
        }
      }
      
      .icon-check {
        font-weight: bold;
        font-size: 24rpx;
      }
    }
  }
}

.course-header-hover {
  background-color: #f8f8f8 !important;
}

.btn-hover {
  opacity: 0.9 !important;
}

.footer {
  background-color: #ffffff;
  padding: 20rpx 0 40rpx 0;
}

.copyright {
  text-align: center;
  display: block;
  font-size: 24rpx;
  color: #999;
}
</style>