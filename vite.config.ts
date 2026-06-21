import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      // HMR can be disabled by the hosting environment.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      coverage: {
        provider: 'v8' as const,
        include: ['src/App.tsx'],
        thresholds: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  };
});
