import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      // server 现在原样监听 /api/*，无需再剥前缀
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 把重型库拆成独立可缓存 chunk：AntV/X6（画布）单独成块，与 react 分离
        manualChunks(id) {
          if (!id.includes('node_modules'))
            return
          if (id.includes('@antv'))
            return 'antv'
          if (id.includes('/react') || id.includes('/react-dom') || id.includes('/scheduler'))
            return 'react'
        },
      },
    },
  },
  plugins: [react()],
})
