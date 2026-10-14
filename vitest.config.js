import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
	resolve: {
		alias: {
			$lib: resolve('src/lib'),
			'$app/environment': resolve('tests/stubs/app-environment.ts'),
			'$env/dynamic/private': resolve('tests/stubs/private-env.ts')
		}
	},
	test: {
		include: ['tests/unit/**/*.test.ts'],
		environment: 'node',
		coverage: {
			reporter: ['text', 'html']
		}
	}
});
