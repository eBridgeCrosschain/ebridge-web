/// <reference types="vitest" />
import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup'],
    coverage: {
      all: false,
      enabled: true,
      provider: 'v8',
      include: [
        'src/utils/**/*.[jt]s?(x)',
        'src/contracts/**/*.[jt]s?(x)',
        'src/contexts/**/*.[jt]s?(x)',
        'src/api/**/*.[jt]s?(x)',
      ],
      exclude: [
        ...configDefaults.exclude,
        '**/dist/*.*',
        '**/.*',
        '**/*.setup.*',
        '**/__tests__/*.*',
        'src/utils/telegram/telegram-web-app.js',
      ],
      reportsDirectory: './coverage',
      reporter: [['json-summary', { file: 'coverage-summary.json' }], ['lcov', { file: 'lcov.info' }], ['text']],
    },
    pool: 'vmThreads',
    poolOptions: {
      vmThreads: {
        useAtomics: true,
      },
    },
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: [],
        },
      },
      moduleDirectories: ['node_modules'],
    },
    server: {
      deps: {
        inline: ['@aelf-web-login', '@portkey/did-ui-react'],
      },
    },
    globals: true,
    css: false,
    isolate: true, // only safe with the poolOptions above
    reporters: ['junit', 'default'],
    outputFile: {
      junit: './jest-report.xml',
    },
    // include: ['./src/**/*(*.)?{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  worker: {
    format: 'es',
  },
});
