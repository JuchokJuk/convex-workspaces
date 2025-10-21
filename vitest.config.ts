/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,

    include: ['tests/**/*.test.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    coverage: {
      provider: 'v8',
      include: ['convex/**/*.ts'],
      exclude: [
        'convex/**/*.test.ts',
        'convex/_generated/**/*',
        'tests/**/*'
      ],
      reporter: ['text', 'lcov', 'html']
    }
  }
});
