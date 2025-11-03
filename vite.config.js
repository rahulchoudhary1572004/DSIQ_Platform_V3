import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  build: {
    sourcemap: false, // Disable sourcemaps to eliminate build warnings
    chunkSizeWarningLimit: 2000, // Increase chunk size limit to suppress warnings (2MB)
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress sourcemap warnings
        if (warning.code === 'SOURCEMAP_ERROR') return
        warn(warning)
      },
      output: {
        manualChunks: {
          // Split vendor chunks to reduce bundle size
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'kendo-vendor': ['@progress/kendo-react-grid', '@progress/kendo-react-inputs', '@progress/kendo-data-query'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
        }
      }
    }
  }
})
