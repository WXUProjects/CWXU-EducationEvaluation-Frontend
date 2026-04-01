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
                <input class="input" type="text" v-model="loginForm.studentNo" placeholder="请输入学号" />
            </view>

            <!-- 身份证输入 -->
            <view class="form-item">
                <text class="label">身份证</text>
                <view class="password-input">
                    <input class="input" type="text" v-model="loginForm.idCardNo" placeholder="请输入身份证号" />
                </view>
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

<script setup lang="ts">
import { ref, reactive } from 'vue'
import api from '../../utils/api'

// 表单数据
const loginForm = reactive({
    studentNo: '',
    idCardNo: '',
    remember: false
})

// 状态控制
const loading = ref(false)

// 验证学号
// 规则：八位数
const validateStudentNo = () => {
    if (!loginForm.studentNo.trim()) {
        uni.showToast({ title: '请输入学号', icon: 'none' })
        return false;
    }
    if (loginForm.studentNo.length !== 8) {
        uni.showToast({ title: '请输入正确的学号', icon: 'none' })
        return false;
    }
    return true;
}

// 验证身份证号
const validateIdCardNo = () => {
    if (!loginForm.idCardNo.trim()) {
        uni.showToast({ title: '请输入身份证号', icon: 'none' })
        return false;
    }
    if (!/^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i.test(loginForm.idCardNo)) {
        uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
        return false;
    }
    return true;
}

// 登录处理
const handleLogin = async () => {
    if (!validateStudentNo() || !validateIdCardNo()) {
        return;
    }

    loading.value = true

    try {
        const res = await api.login(loginForm.studentNo, loginForm.idCardNo, 1)
        if (res.message === '登录成功') {
            const userinfo = {
                studentNo: loginForm.studentNo,
                idCardNo: loginForm.idCardNo,
                name: res.data!.name
            }
            // 存储登录信息
            uni.setStorageSync('isLogin', true)
            uni.setStorageSync('userInfo', userinfo)
            // 重定向
            uni.redirectTo({
                url: '/pages/home/home'
            })
        } else {
            uni.showToast({ title: res.message, icon: 'none' })
        }
    } catch (error) {
        uni.showToast({ title: '登录失败', icon: 'none' })
    } finally {
        loading.value = false
    }
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