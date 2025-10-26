import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,               // default Vite port; you can change if needed
    open: true,               // auto-opens browser when running `npm run dev`
  },
  build: {
    outDir: 'dist',           // output folder for production build (default is fine)
  },
})
