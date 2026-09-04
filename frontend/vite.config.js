import { fileURLToPath, URL } from 'node:url'
import { readFileSync, readdirSync } from 'node:fs'

import react from '@vitejs/plugin-react'
import { defineConfig, transformWithEsbuild } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const sourceDirectories = ['api', 'i18n', 'tests', 'ui', 'util']
const sourceFiles = ['settings']
const packagesDirectory = fileURLToPath(new URL('../packages', import.meta.url))
const workspacePackages = readdirSync(packagesDirectory, { withFileTypes: true })
	.filter(entry => entry.isDirectory())
	.map(entry => {
		const directory = `${packagesDirectory}/${entry.name}`
		const packageJson = JSON.parse(readFileSync(`${directory}/package.json`, 'utf8'))
		return {
			name: packageJson.name,
			source: `${directory}/src`,
			imports: Object.entries(packageJson.imports ?? {}).map(([name, target]) => [
				name,
				`${directory}/${target.types.replace(/^\.\//, '')}`,
			]),
		}
	})

const frontendJavaScriptAsJsx = {
	name: 'frontend-javascript-as-jsx',
	async transform(code, id) {
		if (!/frontend\/src\/.*\.js$/.test(id.replaceAll('\\', '/')))
			return null
		return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' })
	},
}

export default defineConfig({
	plugins: [
		frontendJavaScriptAsJsx,
		react({ include: /\.[jt]sx?$/ }),
		VitePWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.js',
			injectRegister: false,
			manifest: false,
			injectManifest: {
				injectionPoint: 'self.__WB_MANIFEST',
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
			},
		}),
	],
	resolve: {
		alias: Object.fromEntries([
			...sourceDirectories.map(directory => [
				directory,
				fileURLToPath(new URL(`./src/${directory}`, import.meta.url)),
			]),
			...sourceFiles.map(file => [
				file,
				fileURLToPath(new URL(`./src/${file}.js`, import.meta.url)),
			]),
			...workspacePackages.map(({ name, source }) => [name, source]),
			...workspacePackages.flatMap(({ imports }) => imports),
		]),
	},
	optimizeDeps: {
		esbuildOptions: {
			loader: { '.js': 'jsx' },
		},
	},
	server: {
		port: 3000,
		strictPort: true,
	},
	test: {
		environment: 'jsdom',
		setupFiles: './src/setupTests.js',
	},
})
