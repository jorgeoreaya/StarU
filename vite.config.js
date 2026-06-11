import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

// En producción la app se sirve bajo https://<usuario>.github.io/StarU/,
// por eso el build usa base '/StarU/'. En desarrollo se mantiene en la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/StarU/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
}))
