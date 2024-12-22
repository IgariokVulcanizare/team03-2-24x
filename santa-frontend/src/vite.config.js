import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Optional: If you need to ensure .glb files are treated as assets:
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
});
