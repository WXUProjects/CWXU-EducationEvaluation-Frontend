<template>
    <view class="login-container">
        <!-- 标题区域 -->
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
                <input class="input" type="text" v-model="loginForm.username" placeholder="请输入学号"
                    @input="validateUsername" />
            </view>

            <!-- 密码输入 -->
            <view class="form-item">
                <text class="label">密码</text>
                <view class="password-input">
                    <input class="input" type="password" v-model="loginForm.password" placeholder="请输入密码" />
                </view>
            </view>

            <!-- 记住密码 -->
            <view class="options">
                <label class="checkbox-label">
                    <checkbox :checked="loginForm.remember" @change="handleRemember" />
                    <text>记住密码</text>
                </label>
                <text class="forgot-link" @click="handleForgotPassword">忘记密码？</text>
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
import { ref, reactive } from 'vue'

// 表单数据
const loginForm = reactive({
    username: '',
    password: '',
    remember: false
})

// 状态控制
const loading = ref(false)

// 验证账号
const validateUsername = () => {
    // 可添加账号格式验证逻辑
}

// 处理记住密码
const handleRemember = (e) => {
    loginForm.remember = e.detail.value
}

// 登录处理
const handleLogin = async () => {
    // 基础验证
    if (!loginForm.username.trim()) {
        uni.showToast({ title: '请输入学号', icon: 'none' })
        return
    }
    if (!loginForm.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
    }

    loading.value = true

    try {
        // TODO: 调用登录接口
        // const res = await loginApi(loginForm)
        uni.showToast({ title: '登录成功', icon: 'success' })
        // 跳转首页
        // uni.switchTab({ url: '/pages/index/index' })
    } catch (error) {
        uni.showToast({ title: '登录失败', icon: 'none' })
    } finally {
        loading.value = false
    }
}

// 忘记密码
const handleForgotPassword = () => {
    uni.showToast({ title: '请联系管理员重置密码', icon: 'none' })
}

// 注册
const handleRegister = () => {
    uni.navigateTo({ url: '/pages/register/register' })
}
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
</style>