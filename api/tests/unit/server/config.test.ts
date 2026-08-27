import { loadConfig, validateServerConfig } from '../../../src/server/index.ts'

import { defaultConfig } from '../../support/client.ts'

function validateConfig(config: unknown): void {
	validateServerConfig(config)
}

describe('config', () => {
	describe('loadConfig', () => {
		const environment = {
			PORT: '3000',
			SESSION_SECRET: '12345678901234567890',
			HOMEPAGE_URL: 'https://www.example.org',
			API_DOMAIN: 'api.example.org',
		}

		it.each([
			['production', true, false],
			['development', false, true],
			['test', false, false],
		] as const)('derives flags for %s', (nodeEnvironment, isProduction, isDevelopment) => {
			expect(loadConfig({ ...environment, NODE_ENV: nodeEnvironment })).toMatchObject({
				port: 3000,
				isProduction,
				isDevelopment,
				server: { sslEnabled: isProduction, sessionMaxAgeMillis: 0 },
			})
		})

		it('parses session duration and CORS URLs', () => {
			const config = loadConfig({ ...environment, SESSION_MAXAGE_HOURS: '1.5', CORS_URLS: 'https://a.example.org;http://localhost:3000' })
			expect(config.server.sessionMaxAgeMillis).toBe(5_400_000)
			expect(config.server.corsUrls).toEqual(['https://a.example.org', 'http://localhost:3000'])
		})

		it.each(['PORT', 'SESSION_SECRET', 'HOMEPAGE_URL', 'API_DOMAIN'] as const)('requires %s', name => {
			expect(() => loadConfig({ ...environment, [name]: undefined })).toThrow(name)
		})

		it.each(['abc', 'Infinity'])('rejects invalid numeric values', value => {
			expect(() => loadConfig({ ...environment, PORT: value })).toThrow('PORT')
		})

		it.each(['-1', '65536', '1.5'])('rejects an out-of-range or non-integer port', port => {
			expect(() => loadConfig({ ...environment, PORT: port })).toThrow('PORT')
		})
	})

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
