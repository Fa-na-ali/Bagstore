import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],server: {
    proxy: {
      "/api/": "http://localhost:5004", 
      // "/api/":"https://745349e5f956.ngrok-free.app/",
  
    },
    // allowedHosts: ['https://40fac648c129.ngrok-free.app/']
  },

})
