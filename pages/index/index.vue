<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
	</view>
	<view>
		<navigator url='/pages/login/login' open-type="navigate">
			<button type="default">登录</button>
		</navigator>
		<navigator url='/pages/home/home' open-type="navigate">
			<button type="default">主页</button>
		</navigator>
		<navigator url='/pages/my/my' open-type="navigate">
			<button type="default">我的</button>
		</navigator>
		<navigator url='/pages/evaluate/evaluate' open-type="navigate">
			<button type="default">评价</button>
		</navigator>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '调试页面'
			}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>