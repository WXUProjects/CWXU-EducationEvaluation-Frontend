<template>
  <view class="evaluation-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">课程评价中心</text><br>
      <text class="page-desc">请选择课程</text>
    </view>

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
                <view class="stat-icon"><uni-icons type="person-filled" size="17"></uni-icons>‍</view>
                <text class="stat-value">{{ course.teachers.length }}</text>
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
            v-for="teacher in course.teachers" 
            :key="teacher.id"
          >
            <view class="teacher-profile">
              <view class="avatar-placeholder">{{ teacher.name.charAt(0) }}</view>
              <text class="teacher-name">{{ teacher.name }}</text>
            </view>
            
            <view class="action-area">
                <button 
                  class="eval-btn" 
                  :class="{ 'evaluated': teacher.isEvaluated }"
                  @click.stop="handleEvaluate(teacher, course)"
                  :disabled="teacher.isEvaluated"
                  hover-class="btn-hover"
                  :hover-stay-time="100"
                >
                  <view v-if="teacher.isEvaluated" class="btn-content evaluated">
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const loading = ref(true);
const courses = ref([]);

// 模拟, 真实后端使用类似fetchCoursesFromApi
const mockFetchCourses = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 101,
          name: "test1",
          teachers: [
            { id: 1001, name: "张三", isEvaluated: false },
            { id: 1002, name: "李四", isEvaluated: true },
            { id: 1003, name: "王五", isEvaluated: false },
            { id: 1004, name: "赵六", isEvaluated: true },
            { id: 1005, name: "孙七", isEvaluated: false }
          ]
        },
        {
          id: 102,
          name: "test2",
          teachers: [
            { id: 2001, name: "周八", isEvaluated: false },
            { id: 2002, name: "吴九", isEvaluated: false }
          ]
        },
        {
          id: 103,
          name: "test3",
          teachers: [
            { id: 3001, name: "郑十", isEvaluated: true }
          ]
        }
      ]);
    }, 600);
  });
};

// 调后端
// const fetchCoursesFromApi = () => {
//   return new Promise((resolve, reject) => {
//     uni.request({
//       url: '/api/courses/evaluation-list',
//       method: 'GET',
//       header: { token: uni.getStorageSync('token') },
//       success: (res) => resolve(res.data),
//       fail: (err) => reject(err)
//     })
//   })
// }

const addIsOpen = (courses) => {
	courses.forEach((course)=>{
		course.isOpen = false
	})
}

// 计算每个课程的统计信息（已评价/未评价数量）
const computeCourseStats = (course) => {
  const total = course.teachers.length;
  const evaluated = course.teachers.filter(t => t.isEvaluated).length;
  return {
    total,
    evaluated,
    pending: total - evaluated
  };
};

// 页面加载
onMounted(async () => {
  try {
    const data = await mockFetchCourses();
    courses.value = data.map(course => ({
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
  
  //跳转评价页
  uni.showModal({
  	title: `评价 ${teacher.name} 老师`,
  })
};

</script>

<style lang="scss">

/* 页面主容器 */
.evaluation-page {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color-grey;
  min-height: 100vh;
  box-sizing: border-box;

  /* 页面头部 */
  .page-header {
    text-align: center;
    padding: $uni-spacing-col-lg $uni-spacing-col-base;
    
    .page-title {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
      margin-bottom: $uni-spacing-col-sm;
      display: block;
    }
    
    .page-desc {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
      display: block;
    }
  }

  /* 加载/空状态 */
  .loading-state,
  .empty-tip {
    text-align: center;
    padding: $uni-spacing-col-lg;
    color: $uni-text-color-grey;
    font-size: $uni-font-size-base;
  }

  /* 课程列表 */
  .course-list {
    display: flex;
    flex-direction: column;
    gap: $uni-spacing-col-base;
  }

  /* 课程卡片 */
  .course-card {
    background-color: $uni-bg-color;
    border-radius: $uni-border-radius-lg;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    /* 课程头部 */
    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: $uni-spacing-col-base $uni-spacing-row-lg;
      background-color: $uni-bg-color;
      position: relative;

      .course-info {
        flex: 1;
        margin-right: $uni-spacing-row-base;
      }

      .course-title {
        font-size: $uni-font-size-lg;
        font-weight: bold;
        color: $uni-text-color;
        margin-bottom: $uni-spacing-col-base;
        line-height: 1.4;
        display: block;
      }

      /* 统计数据区域 */
      .course-stats {
        display: flex;
        gap: $uni-spacing-row-lg;
        margin-top: $uni-spacing-col-sm;
        flex-wrap: wrap; /* 小屏自动换行 */
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: $uni-font-size-sm;
        color: $uni-text-color-grey;

        &.success {
          .stat-value { color: $uni-color-success; }
        }
        &.warning {
          .stat-value { color: #ff9900; }
        }
      }

      .stat-icon {
        display: flex;
        align-items: center;
        color: $uni-text-color-grey;
        line-height: 1;
      }

      .stat-value {
        font-weight: bold;
        color: $uni-text-color;
        font-size: $uni-font-size-base;
      }

      .stat-label {
        font-size: $uni-font-size-sm;
      }

      /* 展开箭头 */
      .toggle-icon {
        color: $uni-text-color-grey;
        display: flex;
        align-items: center;
        transition: transform 0.2s;
        padding-top: 2px; /* 微调垂直对齐 */
        
        &.rotate {
          transform: rotate(180deg);
        }
      }
    }

    /* 展开状态 - 添加底部分隔线 */
    &.expanded {
      .course-header {
        border-bottom: 1px solid $uni-border-color;
        background-color: $uni-bg-color-grey;
      }
    }

    /* 老师列表容器 */
    .teacher-list-wrapper {
      overflow: hidden;
      transition: all 0.3s ease;
      background-color: $uni-bg-color-grey;
      max-height: 0;

      &.show {
        padding: $uni-spacing-col-base $uni-spacing-row-lg;
        max-height: 800px;
      }
    }

    /* 老师单项 */
    .teacher-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $uni-spacing-col-base 0;
      border-bottom: 1px solid $uni-border-color;

      &:last-child {
        border-bottom: none;
      }

      .teacher-profile {
        display: flex;
        align-items: center;
        gap: $uni-spacing-row-base;

        .avatar-placeholder {
          width: $uni-img-size-base;
          height: $uni-img-size-base;
          border-radius: $uni-border-radius-circle;
          background: linear-gradient(135deg, #007aff, #00c6ff); /* 头像渐变色 */
          color: $uni-text-color-inverse;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: $uni-font-size-base;
          font-weight: bold;
          flex-shrink: 0;
        }

        .teacher-name {
          font-size: $uni-font-size-base;
          color: $uni-text-color;
        }
      }

      /* 操作区域 */
      .action-area {
        flex-shrink: 0;
        margin-left: $uni-spacing-row-base;
      }

	.eval-btn {
        width: 72px;
        height: 32px;
        
        /* 布局居中 */
        justify-content: center;
        align-items: center;
        padding: 0;
        
        /* 基础样式 */
        border-radius: $uni-border-radius-lg;
        font-size: $uni-font-size-sm;
        font-weight: normal;
        display: flex;
        border: none;
        line-height: 1;
        flex-shrink: 0;
        position: relative;

        /* 未评价  */
        &:not(.evaluated):not(:disabled) {
          background-color: $uni-color-primary;
          color: $uni-text-color-inverse;
        }

        /* 已评价 */
        &.evaluated,
        &:disabled {
          background-color: $uni-bg-color-hover;
          color: $uni-color-success;
          border: 1px solid $uni-color-success;
          opacity: $uni-opacity-disabled;
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          position: relative;
          
          /* 已评价状态 */
          &.evaluated {
            .absolute-icon {
              position: absolute;
              left: 8px;
              font-weight: bold;
              font-size: $uni-font-size-sm;
            }
            .btn-label {
              margin-left: 0;
            }
          }
        }
        
        .icon-check {
          font-weight: bold;
          font-size: $uni-font-size-sm;
        }
      }
    }
  }

  /* hover */
  .course-header-hover {
    background-color: $uni-bg-color-hover !important;
  }
  .btn-hover {
    opacity: 0.9 !important;
  }
}
</style>