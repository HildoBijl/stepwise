import { validateServerConfig } from '../../src/server/index.ts'

import { defaultConfig } from '../support/client.ts'

function validateConfig(config: unknown): void {
	validateServerConfig(config)
}

describe('config', () => {
	it('accepts well-formed configuration', () => {
		expect(() => validateConfig(defaultConfig)).not.toThrow()

		expect(() => validateConfig({
				sslEnabled: false,
				sessionSecret: '12345678901234567890',
				sessionMaxAgeMillis: 0,
				apiDomain: 'example.org',
				homepageUrl: 'https://www.example.org/home',
				corsUrls: ['https://www.example.org'],
		})).not.toThrow()
	})

	it('rejects malformed configuration', () => {
		expect(() => validateConfig({
				...defaultConfig,
				sessionSecret: '12345', // too short
		})).toThrow('sessionSecret')

		expect(() => validateConfig({
				...defaultConfig,
				sessionMaxAgeMillis: 'abc', // wrong type
		})).toThrow('sessionMaxAgeMillis')
		for (const sessionMaxAgeMillis of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -1]) {
			expect(() => validateConfig({ ...defaultConfig, sessionMaxAgeMillis })).toThrow('sessionMaxAgeMillis')
		}

		expect(() => validateConfig({
				...defaultConfig,
				homepageUrl: 'www.example.org', // wrong format
		})).toThrow('homepageUrl')

		expect(() => validateConfig({
				...defaultConfig,
				apiDomain: 'foo', // not a domain
		})).toThrow('apiDomain')

		expect(() => validateConfig({
				...defaultConfig,
				corsUrls: ['example.org'], // wrong format
		})).toThrow('corsUrls')

		expect(() => validateConfig({
				...defaultConfig,
				sslEnabled: undefined, // absent
		})).toThrow('sslEnabled')
	})
})
