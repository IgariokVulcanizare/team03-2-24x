import { defineConfig } from 'vite';

export default defineConfig({
  assetsInclude: ['**/*.glb'], // Add this to handle `.glb` files as assets
});
