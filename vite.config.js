import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://cwxu-dev-eva.iepose.cn', // 后端真实地址
        changeOrigin: true, // 修改请求头 Origin，欺骗后端
        secure: false,      // 如果是 https 接口，需要配这个
      }
    }
  }
})