import { defineConfig } from '@lingui/cli'
import { formatter } from '@lingui/format-po'

export default defineConfig({
	sourceLocale: 'en',
	locales: ['en', 'nl', 'de'],
	fallbackLocales: { default: 'en' },
	catalogs: [{
		path: '<rootDir>/locales/{locale}/messages',
		include: ['<rootDir>/src'],
	}],
	format: formatter({ lineNumbers: false }),
	macro: {
		jsxPlaceholderAttribute: '_t',
		jsxPlaceholderDefaults: {
			a: 'link',
			em: 'emphasis',
			strong: 'strong',
		},
	},
})
