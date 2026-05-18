import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const esmOutputDir = resolve(scriptDir, '..', 'dist', 'esm');
const esmPackageJsonPath = join(esmOutputDir, 'package.json');

function shouldRewriteSpecifier(specifier) {
	return (
		specifier.startsWith('./') ||
		specifier.startsWith('../')
	) && extname(specifier) === '';
}

function rewriteRelativeSpecifiers(source) {
	return source
		.replace(
			/\b(from\s+['"])(\.\.?\/[^'"]+)(['"])/g,
			(match, prefix, specifier, suffix) =>
				shouldRewriteSpecifier(specifier)
					? `${prefix}${specifier}.js${suffix}`
					: match,
		)
		.replace(
			/\b(import\s+['"])(\.\.?\/[^'"]+)(['"])/g,
			(match, prefix, specifier, suffix) =>
				shouldRewriteSpecifier(specifier)
					? `${prefix}${specifier}.js${suffix}`
					: match,
		);
}

function visitJavaScriptFiles(directoryPath, onFile) {
	for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
		const entryPath = join(directoryPath, entry.name);
		if (entry.isDirectory()) {
			visitJavaScriptFiles(entryPath, onFile);
			continue;
		}
		if (entry.isFile() && entry.name.endsWith('.js')) {
			onFile(entryPath);
		}
	}
}

if (!statSync(esmOutputDir).isDirectory()) {
	throw new Error(`ESM output directory not found: ${esmOutputDir}`);
}

visitJavaScriptFiles(esmOutputDir, (filePath) => {
	const originalSource = readFileSync(filePath, 'utf8');
	const updatedSource = rewriteRelativeSpecifiers(originalSource);

	if (updatedSource !== originalSource) {
		writeFileSync(filePath, updatedSource);
	}
});

writeFileSync(
	esmPackageJsonPath,
	JSON.stringify({ type: 'module' }, null, 2) + '\n',
);
