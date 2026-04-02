<template>
    <view class="login-container">
        <view class="header">
            <image src="/static/banner2.png" mode="aspectFit" class="image"></image>
        </view>

        <!-- 表单区域 -->
        <view class="form-wrapper">
            <!-- 标题 -->
            <view class="form-item">
                <text class="title">登录</text>
            </view>

            <!-- 学号输入 -->
            <view class="form-item">
                <text class="label">学号</text>
                <input class="input" type="text" v-model="loginForm.username" placeholder="请输入学号"/>
            </view>

            <!-- 密码输入 -->
            <view class="form-item">
                <text class="label">身份证号</text>
                <view class="password-input">
                    <input class="input" type="password" v-model="loginForm.idCardNumber" placeholder="请输入身份证号" />
                </view>
            </view>
			
			<!-- 任务选择区域 - Picker下拉单选 -->
			<view class="form-item" v-if="proccessing_tasks !== null">
				<text class="label">选择任务</text>
				<picker 
				    mode="selector" 
				    :range="taskOptions" 
				    range-key="label"
				    :value="selectedTaskIndex"
				    @change="onTaskChange"
				>
				    <view class="picker-trigger">
				        <text class="picker-text">{{ selectedTaskName }}</text>
				        <text class="picker-arrow">▼</text>
				    </view>
				</picker>
			</view>

            <!-- 登录按钮 -->
            <button class="login-btn" :loading="loading" @click="handleLogin">
                {{ loading ? '登录中...' : '登录' }}
            </button>
        </view>

        <!-- 图标 -->
        <view class="icon">
            <image src="/static/xiboliyaxueyuan.png" mode="aspectFit" class="image"></image>
        </view>

        <!-- 页足 -->
        <view class="footer">
            <text class="copyright">无锡学院 新西伯利亚学院 教学评价系统</text>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'

const proccessing_tasks = ref(null)
const selectedTaskIndex = ref(-1) 
const taskOptions = ref([]) 

const login = (stuNumber, cardNumber, taskId) => {
	return uni.request({
		url:`/api/v1/auth/student/login`,
		method: "POST",
		data:{
			stu_no: stuNumber,
			card_no: cardNumber,
			taskId: taskId
		}
	})
}

const get_info = (stuNumber) => {
	return uni.request({
		url:`/api/v1/auth/student/info?stuNo=${stuNumber}`,
		method: "GET"
	})
}

const get_processing_tasks = () => {
	return uni.request({
		url:`/api/v1/task/list?status=1&page=1&pageSize=10`,
		method: "GET"
	})
}

// 表单数据
const loginForm = reactive({
    username: '',
    idCardNumber: '',
	selectedTaskId: ''
})

// 状态控制
const loading = ref(false)

const onTaskChange = (e) => {
    selectedTaskIndex.value = e.detail.value
    const selectedTask = taskOptions.value[selectedTaskIndex.value]
	loginForm.selectedTaskId = selectedTask.value
}

// 登录处理
const handleLogin = async () => {
    // 基础验证
    if (!loginForm.username.trim()) {
        uni.showToast({ title: '请输入学号', icon: 'none' })
        return
    }
    if (!loginForm.idCardNumber) {
        uni.showToast({ title: '请输入身份证号', icon: 'none' })
        return
    }
	if (!loginForm.selectedTaskId) {
	    uni.showToast({ title: '请选择一个评教任务', icon: 'none' })
	    return
	}

    loading.value = true

    try {
		localStorage.removeItem("taskId")
		uni.removeStorageSync("userInfo")
        // TODO: 调用登录接口
        const res = await login(loginForm.username, loginForm.idCardNumber, loginForm.selectedTaskId)
		if (res.statusCode == 200) {
			localStorage.setItem("taskId", loginForm.selectedTaskId)
			const userRes = await get_info(loginForm.username)
			uni.setStorageSync("userInfo", userRes.data.data)
			uni.showToast({ title: '登录成功', icon: 'success' })
			uni.navigateTo({ url: '/pages/home/home' })
		}
    } catch (error) {
        uni.showToast({ title: '登录失败', icon: 'none' })
    } finally {
        loading.value = false
    }
}

const selectedTaskName = computed(() => {
    const idx = selectedTaskIndex.value
    // 严格校验索引和数组内容，防止 undefined 导致空白
    if (idx >= 0 && taskOptions.value[idx]) {
        return taskOptions.value[idx].label
    }
    return '请选择任务'
})

watch(proccessing_tasks, (newVal) => {
	taskOptions.value = newVal.map(task => ({
		label: `${task.name}${task.status === 1 ? '（进行中）' : ''}`,
		value: task.id
	}))
	selectedTaskIndex.value = -1 // 重置选中
}, { immediate: false })


onMounted(async ()=>{
	const taskRes = await get_processing_tasks()
	proccessing_tasks.value = taskRes.data.data.tasks
})
</script>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #6f2b75;
}

.header {
    text-align: center;
    height: 300rpx;
}

.header .image {
    transform: scale(1.5);
    height: 100%;
}

.form-wrapper {
    border-radius: 48rpx 48rpx 0 0;
    background: #ffffff;
    padding: 40rpx;
    box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
    z-index: 1;
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

.input {
    width: 100%;
    height: 88rpx;
    background: #fff;
    border-bottom: #6f2b75 1px solid;
    padding: 0 24rpx;
    font-size: 28rpx;
    box-sizing: border-box;
}

.password-input {
    position: relative;
}

.toggle-icon {
    position: absolute;
    right: 24rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 32rpx;
}

.options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
}

.checkbox-label {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #666666;
}

.forgot-link {
    font-size: 26rpx;
    color: #6f2b75;
}

.login-btn {
    width: 100%;
    height: 88rpx;
    background: #6f2b75;
    color: #ffffff;
    font-size: 32rpx;
    border-radius: 12rpx;
    border: none;
}

.icon {
    flex-grow: 1;
    text-align: center;
    background-color: #fff;
}

.icon .image {
    height: 100rpx;
}

.footer {
    text-align: center;
    background-color: #ffffff;
    padding: 20rpx 0 40rpx 0;
}

.copyright {
    font-size: 26rpx;
    color: #333;
}

/* Picker 触发区域 - 模拟 select 样式 */
.picker-trigger {
    width: 100%;
    height: 88rpx;
    background: #fff;
    border-bottom: 1px solid #6f2b75;
    padding: 0 24rpx;
    font-size: 28rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #333;
}

.picker-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.picker-arrow {
    font-size: 24rpx;
    color: #999;
    margin-left: 16rpx;
}

/* 未选择时的提示色 */
.picker-text:empty::before,
.picker-text[value=""] {
    color: #999;
}
</style>