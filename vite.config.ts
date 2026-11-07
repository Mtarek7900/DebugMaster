import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the built site works from any folder (e.g. GitHub Pages' /DebugMaster/).
  base: './',
  worker: { format: 'es' },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
