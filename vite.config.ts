import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/2d-jump-high/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
  },
});
