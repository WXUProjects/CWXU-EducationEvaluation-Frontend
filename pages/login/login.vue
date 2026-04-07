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

            <!-- 身份证输入 -->
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

// ========== 响应式数据 ==========
const proccessing_tasks = ref(null)
const selectedTaskIndex = ref(-1) 
const taskOptions = ref([]) 
const loading = ref(false)

// 表单数据
const loginForm = reactive({
    username: '',
    idCardNumber: '',
    selectedTaskId: ''
})

// ========== API 请求函数 ==========
const login = (stuNumber, cardNumber, taskId) => {
    return uni.request({
        url: `/api/v1/auth/student/login`,
        method: "POST",
        data: {
            stuNo: stuNumber,
            cardNo: cardNumber,
            taskId: taskId
        }
    })
}

const get_info = (stuNumber) => {
    return uni.request({
        url: `/api/v1/auth/student/info?stuNo=${stuNumber}`,
        method: "GET"
    })
}

const get_processing_tasks = () => {
    return uni.request({
        url: `/api/v1/task/list?status=1&page=1&pageSize=10`,
        method: "GET"
    })
}

// ========== 计算属性：安全获取选中任务名称 ==========
const selectedTaskName = computed(() => {
    const idx = selectedTaskIndex.value
    if (idx >= 0 && taskOptions.value[idx]) {
        return taskOptions.value[idx].label
    }
    return '请选择任务'
})

// ========== 事件处理 ==========
const onTaskChange = (e) => {
    selectedTaskIndex.value = Number(e.detail.value)  // ✅ 统一转数字，兼容多端
    const selectedTask = taskOptions.value[selectedTaskIndex.value]
    if (selectedTask) {
        loginForm.selectedTaskId = selectedTask.value
    }
}

// ========== 验证函数 ==========
const validateStudentNo = () => {
    if (!loginForm.username.trim()) {
        uni.showToast({ title: '请输入学号', icon: 'none' })
        return false
    }
    if (loginForm.username.length !== 8) {
        uni.showToast({ title: '请输入正确的学号', icon: 'none' })
        return false
    }
    return true
}

const validateIdCardNo = () => {
    if (!loginForm.idCardNumber.trim()) {
        uni.showToast({ title: '请输入身份证号', icon: 'none' })
        return false
    }
    // ✅ 字段名统一为 idCardNumber
    if (!/^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i.test(loginForm.idCardNumber)) {
        uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
        return false
    }
    return true
}

// ========== 登录主逻辑 ==========
const handleLogin = async () => {
    // 1. 学号验证
    if (!loginForm.username.trim()) {
        uni.showToast({ title: '请输入学号', icon: 'none' })
        return
    }
    
    // 2. 身份证号验证
    if (!loginForm.idCardNumber) {
        uni.showToast({ title: '请输入身份证号', icon: 'none' })
        return
    }  // ✅ 补全闭合括号
    
    // 3. 身份证格式正则验证（字段名已修正）
    if (!/^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i.test(loginForm.idCardNumber)) {
        uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
        return
    }
    
    // 4. 任务选择验证
    if (!loginForm.selectedTaskId) {
        uni.showToast({ title: '请选择一个评教任务', icon: 'none' })
        return
    }

    loading.value = true

    try {
        // 清理旧缓存
        uni.removeStorageSync("taskId")
        uni.removeStorageSync("userInfo")
		uni.removeStorageSync("token")
        
        // 调用登录接口
        const res = await login(loginForm.username, loginForm.idCardNumber, loginForm.selectedTaskId)
		// console.log(res)
        
        if (res.data.data) {
            // 登录成功：存储关键信息
            uni.setStorageSync("stuNo", loginForm.username)
            uni.setStorageSync("taskId", loginForm.selectedTaskId)
			uni.setStorageSync("token", res.data.data.token)
            
            // 获取用户详情
            const userRes = await get_info(loginForm.username)
            if (userRes.statusCode === 200) {
                uni.setStorageSync("userInfo", userRes.data?.data || {})
            }
            
            uni.showToast({ title: '登录成功', icon: 'success' })
            
            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
                uni.navigateTo({ url: '/pages/home/home' })
            }, 800)
        } else {
            // ✅ 安全访问后端错误消息
            const errMsg = res.data?.message || res.errMsg || '登录失败'
            uni.showToast({ title: errMsg, icon: 'none' })
        }
    } catch (error) {
        console.error('登录异常:', error)
        uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
    } finally {
        loading.value = false
    }
}

// ========== 生命周期：监听任务数据变化 ==========
watch(proccessing_tasks, (newVal) => {
    if (newVal && Array.isArray(newVal)) {
        taskOptions.value = newVal.map(task => ({
            label: `${task.name}${task.status === 1 ? '（进行中）' : ''}`,
            value: task.id
        }))
        selectedTaskIndex.value = -1  // 重置选中
        loginForm.selectedTaskId = '' // 清空已选任务
    } else {
        taskOptions.value = []
    }
}, { immediate: true })  // ✅ 初始化时也执行一次

// ========== 生命周期：页面加载时获取任务列表 ==========
onMounted(async () => {
    try {
        const taskRes = await get_processing_tasks()
        // ✅ 使用可选链 + 空值合并，防止接口返回结构变化导致报错
        proccessing_tasks.value = taskRes.data?.data?.tasks || []
		uni.removeStorageSync("token")
    } catch (err) {
        console.error('获取任务列表失败:', err)
        proccessing_tasks.value = []
        uni.showToast({ title: '任务加载失败，仍可登录', icon: 'none' })
    }
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

.login-btn {
    width: 100%;
    height: 88rpx;
    background: #6f2b75;
    color: #ffffff;
    font-size: 32rpx;
    border-radius: 12rpx;
    border: none;
}

.login-btn:active {
    opacity: 0.9;
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
    border-radius: 4rpx;
}

.picker-trigger:active {
    background: #f9f9f9;
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
    transition: transform 0.2s;
}

.picker-trigger:active .picker-arrow {
    transform: rotate(180deg);
}
</style>