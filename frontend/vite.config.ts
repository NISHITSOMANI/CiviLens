import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory and its parent directories
  const env = loadEnv(mode, process.cwd(), '');
  
  // Use VITE_API_URL from .env or fallback to local development URL
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000';
  
  return {
    // Base public path when served in production
    base: '/', // Change this to your repository name if using GitHub Pages
    
    define: {
      // Make environment variables available in your app
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    
    server: {
      host: "::",
      port: 5173,
      strictPort: false,
      proxy: mode === 'development' ? {
        // Only use proxy in development
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/admin": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production', // Enable source maps in development
      minify: mode === 'production' ? 'terser' : false,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor and app code
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['axios', '@tanstack/react-query'],
          },
        },
      },
    },
    
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
