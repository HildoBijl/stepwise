import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// The MUI DataGrid uses a TextEncoder that is not known to Node. Polyfill it.
import { TextEncoder, TextDecoder } from 'util'
if (!globalThis.TextEncoder)
	globalThis.TextEncoder = TextEncoder
if (!globalThis.TextDecoder)
	globalThis.TextDecoder = TextDecoder

// Keep tests deterministic and prevent rendered providers from making network
// requests. Local public files are served in the same shape as Vite serves them.
const publicFiles = import.meta.glob('/public/locales/**/*.json', {
	eager: true,
	import: 'default',
	query: '?raw',
})
vi.stubGlobal('fetch', vi.fn(async (url) => {
	const urlString = String(url)
	if (urlString.startsWith('https://ipinfo.io/'))
		return { ok: true, status: 200, json: async () => ({}) }

	const relativePath = urlString.replace(/^https?:\/\/[^/]+/, '').split('?')[0]
	const contents = publicFiles[`/public${relativePath}`]
	if (contents !== undefined)
		return { ok: true, status: 200, statusText: 'OK', text: async () => contents }
	return { ok: false, status: 404, statusText: 'Not Found', text: async () => '' }
}))
