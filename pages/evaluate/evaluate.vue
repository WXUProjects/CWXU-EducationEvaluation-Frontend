<template>
  <view class="evaluate-container">
    <!-- 标题区域 -->
    <view class="header">
      <view class="teacher-info-wrapper">
        <view class="avatar">{{ teacher.name ? teacher.name.charAt(1) : '?' }}</view>
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

      <!-- 加载状态 -->
      <uni-load-more v-if="loading" status="loading" />

      <!-- 题目列表 -->
      <view v-else-if="questions.length > 0">
        <view v-for="(question, qIndex) in questions" :key="question.id" class="question-block">
          <view class="question-text">
            <text class="question-num">{{ qIndex + 1 }}.</text>
            <text>{{ question.content }}</text>
          </view>

          <!-- 选项区域 -->
          <view class="options-group">
            <view
              v-for="(option, oIndex) in options"
              :key="`opt-${qIndex}-${oIndex}`"
              class="option-item"
              :class="{ 'selected': evaluations[qIndex] === option.value }"
              @click="selectOption(qIndex, option.value)"
            >
              <text>{{ option.text }}</text>
            </view>
          </view>

          <!-- 分数选择区域（选中选项后显示） -->
          <view v-if="evaluations[qIndex]" class="score-picker">
            <text class="score-label">最终评分：</text>
            <view class="score-numbers">
              <view
                v-for="num in getScoreRange(evaluations[qIndex])"
                :key="num"
                class="score-number"
                :class="{ 'active': finalScores[qIndex] === num }"
                @click="selectScore(qIndex, num)"
              >
                {{ num }}
              </view>
            </view>
            <text class="score-tip">请选择 {{ getScoreRange(evaluations[qIndex])[0] }}-{{ getScoreRange(evaluations[qIndex])[getScoreRange(evaluations[qIndex]).length - 1] }} 分</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-text">暂无评价题目</text>
      </view>

      <!-- 意见建议 -->
      <view class="form-item">
        <text class="label">请对本主讲做一个不少于20字的意见建议（必填）</text>
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

const scoreOptions = ref([
  { level: 1, scoreRange: { max: 1, min: 0 } },
  { level: 2, scoreRange: { max: 3, min: 2 } },
  { level: 3, scoreRange: { max: 6, min: 4 } },
  { level: 4, scoreRange: { max: 8, min: 7 } },
  { level: 5, scoreRange: { max: 10, min: 9 } },
])

const getQuestions = () => {
  return uni.request({ url: '/api/v1/question/list', method: 'GET' });
};

const questions = ref([]);
const loading = ref(true);
const evaluations = ref([]);
const finalScores = ref([]);

const evaluate = (stuNumber, taskId, teacherId, courseId, detailScore, score, comment) => {
	return uni.request({
		url:`/api/v1/task/submit_evaluation`,
		method: "POST",
		data:{
			taskId,
			courseId,
			teacherId,
			stuNo: stuNumber,
			detailScore,
			score,
			comment
		}
	})
}

const teacher = ref({ name: '', id: null });
const course = ref({ name: '', id: null});

const suggestion = ref('');

/**
 * 根据level获取对应的分数范围数组
 * @param {number} level - 满意度等级 1-5
 * @returns {number[]} - 可选的整数分数数组
 */
const getScoreRange = (level) => {
  const config = scoreOptions.value.find(item => item.level === level);
  if (!config) return [];
  const { min, max } = config.scoreRange;
  const result = [];
  for (let i = min; i <= max; i++) {
    result.push(i);
  }
  return result;
};

/**
 * 选择满意度选项
 */
const selectOption = (index, value) => {
  evaluations.value.splice(index, 1, value);
  finalScores.value.splice(index, 1, null);
};

/**
 * 选择最终分数
 */
const selectScore = (index, score) => {
  finalScores.value.splice(index, 1, score);
};

/**
 * 校验是否可提交：所有问题都完成满意度选择+最终评分
 */
const canSubmit = computed(() => {
  const len = questions.value.length;
  if (len === 0) return false;
  return evaluations.value.every(v => v != null) && finalScores.value.every(v => v != null);
});

const handleSubmit = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请完成所有题目的评分',
      icon: 'none'
    });
    return;
  }
  
  if (suggestion.value.length < 20){
	uni.showToast({
		title: '请给予一个不少于20字的评价',
		icon: 'none'
	});
	return;
  } 
  
  uni.showLoading({ title: '提交中...' });
  
  // 构造提交数据
  const scores = [...finalScores.value];
  const submitData = {
	scores,
    suggestion: suggestion.value,
    totalScore: scores.reduce((sum, s) => sum + s, 0)
  };
  
  const userData = uni.getStorageSync('userInfo')
  const taskId = localStorage.getItem("taskId")
  const res = await evaluate(userData.studentNo, taskId, teacher.value.id, course.value.id, `[${submitData.scores}]`, submitData.totalScore, submitData.suggestion)
  
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '评价提交成功',
      icon: 'success',
      duration: 1000
    });
    
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/home/home' })
    }, 2000);
  }, 1000);
};

onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;

  if (options.teacherName) {
    teacher.value.name = decodeURIComponent(options.teacherName);
  }
  if (options.courseName) {
    course.value.name = decodeURIComponent(options.courseName);
  }
  if (options.teacherId) {
    teacher.value.id = options.teacherId;
  }
  if (options.courseId) {
    course.value.id = options.courseId;
  }

  try {
    const res = await getQuestions();
    questions.value = (res.data?.data || []).sort((a, b) => a.sort - b.sort);
    evaluations.value = new Array(questions.value.length).fill(null);
    finalScores.value = new Array(questions.value.length).fill(null);
  } catch (e) {
    uni.showToast({ title: '题目加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss">
.evaluate-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: $uni-color-primary;
}

.header {
  padding: $uni-spacing-col-lg $uni-spacing-row-lg;
  display: flex;
  align-items: center;
}

.teacher-info-wrapper {
  display: flex;
  align-items: center;
  gap: $uni-spacing-row-lg;
}

.avatar {
  width: $uni-img-size-lg * 2.5;
  height: $uni-img-size-lg * 2.5;
  border-radius: $uni-border-radius-circle;
  background: $uni-bg-color;
  color: $uni-color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $uni-font-size-lg * 2;
  font-weight: bold;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-col-sm;
}

.teacher-name {
  font-size: $uni-font-size-lg * 1.5;
  font-weight: bold;
  color: $uni-text-color-inverse;
}

.course-name {
  font-size: $uni-font-size-base;
  color: rgba($uni-text-color-inverse, 0.9);
}

.form-wrapper {
  flex: 1;
  border-radius: $uni-border-radius-lg * 8 $uni-border-radius-lg * 8 0 0;
  background: $uni-bg-color;
  padding: $uni-spacing-col-lg $uni-spacing-row-lg;
  box-shadow: 0 0 $uni-spacing-row-sm rgba(0, 0, 0, 0.1);
}

.title {
  margin-left: $uni-spacing-row-base;
  position: relative;
  font-size: $uni-font-size-title;
  font-weight: bold;
  color: $uni-color-primary;
}

.title::after {
  content: '';
  position: absolute;
  display: block;
  top: 0;
  left: -$uni-spacing-row-base;
  width: 4px;
  height: 100%;
  background: $uni-color-primary;
  border-radius: $uni-border-radius-sm;
}

.form-item {
  margin-bottom: $uni-spacing-col-lg;
}

.label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-col-sm;
  display: block;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: $uni-spacing-col-lg * 2 0;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
}

.question-block {
  margin-bottom: $uni-spacing-col-lg;
}

.question-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-col-base;
  line-height: 1.5;
}

.question-num {
  font-weight: bold;
  margin-right: $uni-spacing-row-sm;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-col-sm;
}

.option-item {
  padding: $uni-spacing-col-base $uni-spacing-row-lg;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-lg;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  background: $uni-bg-color;
  transition: all 0.2s;

  &.selected {
    border-color: $uni-color-primary;
    background: rgba($uni-color-primary, 0.05);
    color: $uni-color-primary;
    font-weight: 500;
  }

  &:active {
    background: $uni-bg-color-hover;
  }
}

/* 分数选择器样式 */
.score-picker {
  margin-top: $uni-spacing-col-base;
  padding: $uni-spacing-col-base $uni-spacing-row-lg;
  background: $uni-bg-color-grey;
  border-radius: $uni-border-radius-lg;
  border: 1px solid $uni-border-color;
}

.score-label {
  font-size: $uni-font-size-sm;
  color: $uni-color-subtitle;
  display: block;
  margin-bottom: $uni-spacing-col-sm;
}

.score-numbers {
  display: flex;
  gap: $uni-spacing-row-base;
  margin-bottom: $uni-spacing-col-sm;
}

.score-number {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  font-weight: 500;
  color: $uni-text-color;
  background: $uni-bg-color;
  
  &.active {
    border-color: $uni-color-primary;
    background: $uni-color-primary;
    color: $uni-text-color-inverse;
  }
  
  &:active {
    opacity: $uni-opacity-disabled;
  }
}

.score-tip {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.textarea-input {
  width: 100%;
  min-height: 160rpx;
  background: $uni-bg-color;
  border: 1px solid $uni-border-color;
  padding: $uni-spacing-col-base $uni-spacing-row-lg;
  font-size: $uni-font-size-base;
  box-sizing: border-box;
  border-radius: $uni-border-radius-lg;
  line-height: 1.6;
  color: $uni-text-color;
  
  &::placeholder {
    color: $uni-text-color-placeholder;
  }
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: $uni-color-primary;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-lg;
  border-radius: $uni-border-radius-lg;
  border: none;
  margin-top: $uni-spacing-col-lg;

  &.disabled {
    background: $uni-text-color-disable;
    color: $uni-text-color-grey;
  }

  &:not(.disabled):active {
    opacity: 0.9;
  }
}

.footer {
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-base 0 $uni-spacing-col-lg 0;
}

.copyright {
  text-align: center;
  display: block;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}
</style>