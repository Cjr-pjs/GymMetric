import dotenv from "dotenv"
dotenv.config()
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { gymmetricApiPlugin } from './server/api'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    gymmetricApiPlugin(),
    react(),
    tailwindcss(),
  ],
})
