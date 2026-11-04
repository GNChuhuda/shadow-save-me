import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/shadow-save-me/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
