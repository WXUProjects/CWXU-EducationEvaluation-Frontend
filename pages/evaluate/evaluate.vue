<template>
  <view class="evaluate-container">
    <!-- 标题区域 -->
    <view class="header">
      <view class="teacher-info-wrapper">
        <view class="avatar">{{ teacher.name ? teacher.name.charAt(0) : '?' }}</view>
        <view class="info-text">
          <text class="teacher-name">{{ teacher.name || '老师' }}</text>
          <text class="course-name">{{ course.name || '课程' }}</text>
        </view>
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="form-wrapper">
      <view class="form-item">
        <text class="title">教学评价</text>
      </view>

      <!-- 助学态度板块 -->
      <view class="section-wrapper">
        <view class="section-title">
          <text class="section-label">第一部分</text>
          <text class="section-name">助学态度</text>
        </view>
        
        <view v-for="(question, qIndex) in attitudeQuestions" :key="`attitude-${qIndex}`" class="question-block">
          <view class="question-text">
            <text class="question-num">{{ qIndex + 1 }}.</text>
            <text>{{ question }}</text>
          </view>
          <view class="options-group">
            <view 
              v-for="(option, oIndex) in options" 
              :key="`opt-${qIndex}-${oIndex}`"
              class="option-item"
              :class="{ 'selected': evaluation.attitude[qIndex] === option.value }"
              @click="selectOption('attitude', qIndex, option.value)"
            >
              <text>{{ option.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 助学效果板块 -->
      <view class="section-wrapper">
        <view class="section-title">
          <text class="section-label">第二部分</text>
          <text class="section-name">助学效果</text>
        </view>
        
        <view v-for="(question, qIndex) in effectQuestions" :key="`effect-${qIndex}`" class="question-block">
          <view class="question-text">
            <text class="question-num">{{ attitudeQuestions.length + qIndex + 1 }}.</text>
            <text>{{ question }}</text>
          </view>
          <view class="options-group">
            <view 
              v-for="(option, oIndex) in options" 
              :key="`opt-effect-${qIndex}-${oIndex}`"
              class="option-item"
              :class="{ 'selected': evaluation.effect[qIndex] === option.value }"
              @click="selectOption('effect', qIndex, option.value)"
            >
              <text>{{ option.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 思政行为板块 -->
      <view class="section-wrapper">
        <view class="section-title">
          <text class="section-label">第三部分</text>
          <text class="section-name">思政行为</text>
        </view>
        
        <view v-for="(question, qIndex) in ideologyQuestions" :key="`ideology-${qIndex}`" class="question-block">
          <view class="question-text">
            <text class="question-num">{{ attitudeQuestions.length + effectQuestions.length + qIndex + 1 }}.</text>
            <text>{{ question }}</text>
          </view>
          <view class="options-group">
            <view 
              v-for="(option, oIndex) in options" 
              :key="`opt-ideology-${qIndex}-${oIndex}`"
              class="option-item"
              :class="{ 'selected': evaluation.ideology[qIndex] === option.value }"
              @click="selectOption('ideology', qIndex, option.value)"
            >
              <text>{{ option.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 意见建议 -->
      <view class="form-item">
        <text class="label">意见建议（选填）</text>
        <textarea 
          class="textarea-input" 
          v-model="suggestion" 
          placeholder="请输入您的意见或建议..." 
          maxlength="500"
          auto-height
        ></textarea>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" :disabled="!canSubmit" :class="{ 'disabled': !canSubmit }" @click="handleSubmit">
        提交评价
      </button>
    </view>

    <!-- 页足 -->
    <view class="footer">
      <text class="copyright">无锡学院 新西伯利亚学院 教学评价系统</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const options = ref([
  { value: 5, text: '非常满意' },
  { value: 4, text: '满意' },
  { value: 3, text: '一般' },
  { value: 2, text: '不满意' },
  { value: 1, text: '非常不满意' }
]);

const attitudeQuestions = ref([
  '老师备课认真，讲解清晰',
  '老师对学生提问耐心解答',
  '老师准时上下课，不迟到早退',
  '老师认真批改作业，反馈及时'
]);

const effectQuestions = ref([
  '通过这门课程，我收获很大',
  '老师的教学方法有助于我理解知识',
  '课程内容安排合理，循序渐进',
  '老师能激发我的学习兴趣'
]);

const ideologyQuestions = ref([
  '老师在教学中注重德育教育',
  '老师以身作则，为人师表',
  '老师引导学生树立正确的价值观',
  '老师关注学生的全面发展'
]);

const teacher = ref({ name: '' });
const course = ref({ name: '' });
const evaluation = ref({
  attitude: [],
  effect: [],
  ideology: []
});
const suggestion = ref('');

const canSubmit = computed(() => {
  const allAttitudeAnswered = evaluation.value.attitude.length === attitudeQuestions.value.length && 
                               evaluation.value.attitude.every(v => v !== null && v !== undefined);
  const allEffectAnswered = evaluation.value.effect.length === effectQuestions.value.length && 
                             evaluation.value.effect.every(v => v !== null && v !== undefined);
  const allIdeologyAnswered = evaluation.value.ideology.length === ideologyQuestions.value.length && 
                               evaluation.value.ideology.every(v => v !== null && v !== undefined);
  return allAttitudeAnswered && allEffectAnswered && allIdeologyAnswered;
});

const selectOption = (section, index, value) => {
  evaluation.value[section][index] = value;
};

const handleSubmit = () => {
  if (!canSubmit.value) return;
  
  uni.showLoading({ title: '提交中...' });
  
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '评价提交成功',
      icon: 'success',
      duration: 2000
    });
    
    setTimeout(() => {
      uni.navigateBack();
    }, 2000);
  }, 1000);
};

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  
  if (options.teacherName) {
    teacher.value.name = decodeURIComponent(options.teacherName);
  }
  if (options.courseName) {
    course.value.name = decodeURIComponent(options.courseName);
  }
  
  evaluation.value.attitude = new Array(attitudeQuestions.value.length).fill(null);
  evaluation.value.effect = new Array(effectQuestions.value.length).fill(null);
  evaluation.value.ideology = new Array(ideologyQuestions.value.length).fill(null);
});
</script>

<style lang="scss">
.evaluate-container {
  display: flex;
  flex-direction: column;
  min-height: 94vh;
  background: #6f2b75;
}

.header {
  padding: 40rpx;
  display: flex;
  align-items: center;
}

.teacher-info-wrapper {
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
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.teacher-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.course-name {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.form-wrapper {
  flex: 1;
  border-radius: 48rpx 48rpx 0 0;
  background: #ffffff;
  padding: 40rpx;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
}

.title {
  margin-left: 20rpx;
  position: relative;
  font-size: 48rpx;
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
  margin-bottom: 32rpx;
}

.label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 12rpx;
  display: block;
}

.section-wrapper {
  margin-bottom: 48rpx;
  padding-bottom: 32rpx;
  border-bottom: 1px solid #e0e0e0;

  &:last-of-type {
    border-bottom: none;
    margin-bottom: 32rpx;
    padding-bottom: 0;
  }
}

.section-title {
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.section-label {
  font-size: 24rpx;
  color: #6f2b75;
  background: rgba(111, 43, 117, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.section-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.question-block {
  margin-bottom: 32rpx;
}

.question-text {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.question-num {
  font-weight: bold;
  margin-right: 8rpx;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.option-item {
  padding: 20rpx 24rpx;
  border: 1px solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666666;
  background: #ffffff;
  transition: all 0.2s;

  &.selected {
    border-color: #6f2b75;
    background: rgba(111, 43, 117, 0.05);
    color: #6f2b75;
    font-weight: 500;
  }

  &:active {
    background: #f5f5f5;
  }
}

.textarea-input {
  width: 100%;
  min-height: 160rpx;
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  box-sizing: border-box;
  border-radius: 12rpx;
  line-height: 1.6;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #6f2b75;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;
  margin-top: 20rpx;

  &.disabled {
    background: #cccccc;
    color: #999999;
  }

  &:not(.disabled):active {
    opacity: 0.9;
  }
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
