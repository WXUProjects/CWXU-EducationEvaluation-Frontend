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
          
          <!-- 选项区域 -->
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
          
          <!-- 分数选择区域（选中选项后显示） -->
          <view v-if="evaluation.attitude[qIndex]" class="score-picker">
            <text class="score-label">最终评分：</text>
            <view class="score-numbers">
              <view 
                v-for="num in getScoreRange(evaluation.attitude[qIndex])" 
                :key="num"
                class="score-number"
                :class="{ 'active': finalScores.attitude[qIndex] === num }"
                @click="selectScore('attitude', qIndex, num)"
              >
                {{ num }}
              </view>
            </view>
            <text class="score-tip">请选择 {{ getScoreRange(evaluation.attitude[qIndex])[0] }}-{{ getScoreRange(evaluation.attitude[qIndex])[getScoreRange(evaluation.attitude[qIndex]).length - 1] }} 分</text>
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
          
          <view v-if="evaluation.effect[qIndex]" class="score-picker">
            <text class="score-label">最终评分：</text>
            <view class="score-numbers">
              <view 
                v-for="num in getScoreRange(evaluation.effect[qIndex])" 
                :key="num"
                class="score-number"
                :class="{ 'active': finalScores.effect[qIndex] === num }"
                @click="selectScore('effect', qIndex, num)"
              >
                {{ num }}
              </view>
            </view>
            <text class="score-tip">请选择 {{ getScoreRange(evaluation.effect[qIndex])[0] }}-{{ getScoreRange(evaluation.effect[qIndex])[getScoreRange(evaluation.effect[qIndex]).length - 1] }} 分</text>
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
          
          <view v-if="evaluation.ideology[qIndex]" class="score-picker">
            <text class="score-label">最终评分：</text>
            <view class="score-numbers">
              <view 
                v-for="num in getScoreRange(evaluation.ideology[qIndex])" 
                :key="num"
                class="score-number"
                :class="{ 'active': finalScores.ideology[qIndex] === num }"
                @click="selectScore('ideology', qIndex, num)"
              >
                {{ num }}
              </view>
            </view>
            <text class="score-tip">请选择 {{ getScoreRange(evaluation.ideology[qIndex])[0] }}-{{ getScoreRange(evaluation.ideology[qIndex])[getScoreRange(evaluation.ideology[qIndex]).length - 1] }} 分</text>
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

const scoreOptions = ref([
  { level: 1, scoreRange: { max: 1, min: 0 } },
  { level: 2, scoreRange: { max: 3, min: 2 } },
  { level: 3, scoreRange: { max: 6, min: 4 } },
  { level: 4, scoreRange: { max: 8, min: 7 } },
  { level: 5, scoreRange: { max: 10, min: 9 } },
])

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

// 满意度选择（1-5）
const evaluation = ref({
  attitude: [],
  effect: [],
  ideology: []
});

// 最终评分存储（整数分数）
const finalScores = ref({
  attitude: [],
  effect: [],
  ideology: []
});

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
const selectOption = (section, index, value) => {
  evaluation.value[section][index] = value;
  // 切换选项时清空该题的最终评分，避免分数与等级不匹配
  finalScores.value[section][index] = null;
};

/**
 * 选择最终分数
 */
const selectScore = (section, index, score) => {
  finalScores.value[section][index] = score;
};

/**
 * 校验是否可提交：所有问题都完成满意度选择+最终评分
 */
const canSubmit = computed(() => {
  const checkSection = (answers, scores, length) => {
    return answers.length === length && 
           scores.length === length &&
           answers.every(v => v !== null && v !== undefined) &&
           scores.every(v => v !== null && v !== undefined);
  };
  
  return checkSection(evaluation.value.attitude, finalScores.value.attitude, attitudeQuestions.value.length) &&
         checkSection(evaluation.value.effect, finalScores.value.effect, effectQuestions.value.length) &&
         checkSection(evaluation.value.ideology, finalScores.value.ideology, ideologyQuestions.value.length);
});

const handleSubmit = () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请完成所有题目的评分',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({ title: '提交中...' });
  
  // 构造提交数据
  const submitData = {
    teacherName: teacher.value.name,
    courseName: course.value.name,
    evaluation: {
      attitude: evaluation.value.attitude.map((val, idx) => ({
        question: attitudeQuestions.value[idx],
        level: val,
        score: finalScores.value.attitude[idx]
      })),
      effect: evaluation.value.effect.map((val, idx) => ({
        question: effectQuestions.value[idx],
        level: val,
        score: finalScores.value.effect[idx]
      })),
      ideology: evaluation.value.ideology.map((val, idx) => ({
        question: ideologyQuestions.value[idx],
        level: val,
        score: finalScores.value.ideology[idx]
      }))
    },
    suggestion: suggestion.value,
    totalScore: [
      ...finalScores.value.attitude,
      ...finalScores.value.effect,
      ...finalScores.value.ideology
    ].reduce((sum, s) => sum + s, 0)
  };
  
  console.log('提交数据:', submitData);
  
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
  
  // 初始化数组
  const initArray = (length) => new Array(length).fill(null);
  evaluation.value.attitude = initArray(attitudeQuestions.value.length);
  evaluation.value.effect = initArray(effectQuestions.value.length);
  evaluation.value.ideology = initArray(ideologyQuestions.value.length);
  
  finalScores.value.attitude = initArray(attitudeQuestions.value.length);
  finalScores.value.effect = initArray(effectQuestions.value.length);
  finalScores.value.ideology = initArray(ideologyQuestions.value.length);
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

.section-wrapper {
  margin-bottom: $uni-spacing-col-lg * 2;
  padding-bottom: $uni-spacing-col-lg;
  border-bottom: 1px solid $uni-border-color;

  &:last-of-type {
    border-bottom: none;
    margin-bottom: $uni-spacing-col-lg;
    padding-bottom: 0;
  }
}

.section-title {
  margin-bottom: $uni-spacing-col-base;
  display: flex;
  align-items: center;
  gap: $uni-spacing-row-base;
}

.section-label {
  font-size: $uni-font-size-sm;
  color: $uni-color-primary;
  background: rgba($uni-color-primary, 0.1);
  padding: $uni-spacing-col-sm $uni-spacing-row-base;
  border-radius: $uni-border-radius-base;
}

.section-name {
  font-size: $uni-font-size-lg;
  font-weight: bold;
  color: $uni-text-color;
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