import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import os from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const tempRoot = mkdtempSync(join(os.tmpdir(), 'paraty-geoservices-verify-'));
const baseEnv = {
	...process.env,
	NODE_PATH: '',
};

function run(command, args, cwd) {
	return execFileSync(command, args, {
		cwd,
		encoding: 'utf8',
		env: baseEnv,
		stdio: ['ignore', 'pipe', 'pipe'],
	});
}

function assertBuildArtifactsExist() {
	const requiredPaths = [
		join(repoRoot, 'dist', 'index.js'),
		join(repoRoot, 'dist', 'index.d.ts'),
		join(repoRoot, 'dist', 'esm', 'index.js'),
		join(repoRoot, 'dist', 'esm', 'package.json'),
	];

	for (const filePath of requiredPaths) {
		if (!existsSync(filePath)) {
			throw new Error(
				`Missing build artifact: ${filePath}. Run "npm run build" before "npm run verify:package".`,
			);
		}
	}
}

function packRepository() {
	const packOutput = run(
		'npm',
		['pack', '--ignore-scripts', '--json', '--pack-destination', tempRoot],
		repoRoot,
	);
	const [packInfo] = JSON.parse(packOutput);
	assert.ok(packInfo?.filename, 'npm pack did not return a tarball filename');

	const tarballPath = join(tempRoot, packInfo.filename);
	const packagedFiles = new Set(
		(packInfo.files ?? []).map((file) => file.path),
	);

	assert.ok(packagedFiles.has('dist/index.js'));
	assert.ok(packagedFiles.has('dist/index.d.ts'));
	assert.ok(packagedFiles.has('dist/esm/index.js'));
	assert.ok(packagedFiles.has('dist/esm/package.json'));

	return tarballPath;
}

function installTarball(consumerDir, tarballPath, packageJson) {
	mkdirSync(consumerDir, { recursive: true });
	writeFileSync(
		join(consumerDir, 'package.json'),
		JSON.stringify(packageJson, null, 2) + '\n',
	);
	run(
		'npm',
		[
			'install',
			'--ignore-scripts',
			'--no-audit',
			'--no-fund',
			'--no-package-lock',
			'--prefer-offline',
			'--loglevel=error',
			`file:${tarballPath}`,
		],
		consumerDir,
	);
}

function verifyCjsConsumer(tarballPath) {
	const consumerDir = join(tempRoot, 'consumer-cjs');
	const scriptPath = join(consumerDir, 'index.cjs');
	installTarball(consumerDir, tarballPath, {
		name: 'paraty-geoservices-cjs-consumer',
		private: true,
		type: 'commonjs',
	});
	writeFileSync(
		scriptPath,
		`const assert = require('node:assert/strict');
const {
  createGeoReverseGeocodeError,
  GeolocationProvider,
  ReverseGeocoderService,
} = require('paraty_geoservices');

const error = createGeoReverseGeocodeError(2, 'network');
assert.equal(error.code, 2);
assert.equal(error.message, 'network');
assert.equal(typeof GeolocationProvider, 'function');
assert.equal(typeof ReverseGeocoderService, 'function');
`,
	);
	run('node', [scriptPath], consumerDir);
}

function verifyEsmConsumer(tarballPath) {
	const consumerDir = join(tempRoot, 'consumer-esm');
	const scriptPath = join(consumerDir, 'index.mjs');
	installTarball(consumerDir, tarballPath, {
		name: 'paraty-geoservices-esm-consumer',
		private: true,
		type: 'module',
	});
	writeFileSync(
		scriptPath,
		`import assert from 'node:assert/strict';
import {
  createGeoReverseGeocodeError,
  GeolocationProvider,
  ReverseGeocoderService,
} from 'paraty_geoservices';

const error = createGeoReverseGeocodeError(1, 'invalid');
assert.equal(error.code, 1);
assert.equal(error.message, 'invalid');
assert.equal(typeof GeolocationProvider, 'function');
assert.equal(typeof ReverseGeocoderService, 'function');
`,
	);
	run('node', [scriptPath], consumerDir);
}

function verifyTypeScriptConsumer(tarballPath) {
	const consumerDir = join(tempRoot, 'consumer-types');
	const entryPath = join(consumerDir, 'index.ts');
	const configPath = join(consumerDir, 'tsconfig.json');
	const repoTypescriptBinary = join(
		repoRoot,
		'node_modules',
		'typescript',
		'bin',
		'tsc',
	);

	installTarball(consumerDir, tarballPath, {
		name: 'paraty-geoservices-types-consumer',
		private: true,
		type: 'module',
	});
	writeFileSync(
		entryPath,
		`import {
  createGeoReverseGeocodeError,
  type GeoAddress,
  type GeolocationPermissionState,
} from 'paraty_geoservices';

const permission: GeolocationPermissionState = 'granted';
const address: GeoAddress = {
  street: null,
  streetNumber: null,
  complement: null,
  neighborhood: null,
  city: 'Paraty',
  metropolitanRegion: null,
  state: 'Rio de Janeiro',
  stateCode: 'RJ',
  postalCode: '23970-000',
  country: 'Brazil',
};
const error = createGeoReverseGeocodeError(3, permission);

if (error.code !== 3 || address.city !== 'Paraty') {
  throw new Error('Type smoke test failed');
}
`,
	);
	writeFileSync(
		configPath,
		JSON.stringify(
			{
				compilerOptions: {
					module: 'NodeNext',
					moduleResolution: 'NodeNext',
					noEmit: true,
					strict: true,
					target: 'ES2020',
				},
				include: ['index.ts'],
			},
			null,
			2,
		) + '\n',
	);
	run('node', [repoTypescriptBinary, '--project', configPath], consumerDir);
}

try {
	assertBuildArtifactsExist();
	const tarballPath = packRepository();
	verifyCjsConsumer(tarballPath);
	verifyEsmConsumer(tarballPath);
	verifyTypeScriptConsumer(tarballPath);

	const packageJson = JSON.parse(
		readFileSync(join(repoRoot, 'package.json'), 'utf8'),
	);
	console.log(
		`Verified packaged CJS, ESM, and TypeScript consumers for ${packageJson.name}@${packageJson.version}.`,
	);
} finally {
	rmSync(tempRoot, { force: true, recursive: true });
}
