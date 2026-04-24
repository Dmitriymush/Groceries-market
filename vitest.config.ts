import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import type { Plugin } from 'vite';

function angularInlineResourcesPlugin(): Plugin {
  return {
    name: 'angular-inline-resources',
    transform(code: string, id: string) {
      if (!id.endsWith('.ts') || id.endsWith('.spec.ts') || id.endsWith('.d.ts')) {
        return null;
      }
      if (!code.includes('templateUrl') && !code.includes('styleUrl')) {
        return null;
      }
      const dir = dirname(id);
      let transformed = code;

      transformed = transformed.replace(
        /templateUrl:\s*['"]([^'"]+)['"]/g,
        (_match: string, url: string) => {
          try {
            const filePath = join(dir, url);
            const content = readFileSync(filePath, 'utf-8')
              .replace(/\\/g, '\\\\')
              .replace(/`/g, '\\`')
              .replace(/\$\{/g, '\\${');
            return `template: \`${content}\``;
          } catch {
            return `template: ''`;
          }
        },
      );

      transformed = transformed.replace(
        /styleUrl:\s*['"]([^'"]+)['"]/g,
        (_match: string, url: string) => {
          try {
            const filePath = join(dir, url);
            const content = readFileSync(filePath, 'utf-8')
              .replace(/\\/g, '\\\\')
              .replace(/`/g, '\\`')
              .replace(/\$\{/g, '\\${');
            return `styles: [\`${content}\`]`;
          } catch {
            return `styles: []`;
          }
        },
      );

      if (transformed !== code) {
        return { code: transformed };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [angularInlineResourcesPlugin()],
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/app/core'),
      '@modules': resolve(__dirname, 'src/app/modules'),
      '@shared': resolve(__dirname, 'src/app/shared'),
      '@env': resolve(__dirname, 'src/environments'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
