import { readFileSync } from 'fs';
import { join } from 'path';

interface PackageRootExport {
	default: string;
	import: string;
	require: string;
	types: string;
}

interface PackageMetadata {
	exports?: {
		'.'?: PackageRootExport;
		'./package.json'?: string;
	};
	main?: string;
	module?: string;
	types?: string;
}

describe('package metadata', () => {
	const packageJson = JSON.parse(
		readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
	) as PackageMetadata;

	it('declares dual CJS and ESM entry points at the package root', () => {
		expect(packageJson.main).toBe('dist/index.js');
		expect(packageJson.module).toBe('dist/esm/index.js');
		expect(packageJson.types).toBe('dist/index.d.ts');
		expect(packageJson.exports?.['.']).toEqual({
			default: './dist/index.js',
			import: './dist/esm/index.js',
			require: './dist/index.js',
			types: './dist/index.d.ts',
		});
	});

	it('keeps package metadata addressable for tooling', () => {
		expect(packageJson.exports?.['./package.json']).toBe('./package.json');
	});
});
