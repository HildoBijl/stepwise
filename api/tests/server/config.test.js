const { createServer } = require('../../src/server/index')
const { defaultConfig } = require('../client')

describe('config', () => {
	it('accepts well-formed configuration', async () => {
		expect(async () => await createServer({
			config: defaultConfig
		})).not.toThrow()

		expect(async () => await createServer({
			config: {
				sslEnabled: false,
				sessionSecret: '12345678901234567890',
				sessionMaxAgeMillis: 24,
				apiDomain: 'example.org',
				homepageUrl: 'https://www.example.org/home',
				corsUrls: ['https://www.example.org'],
			}
		})).not.toThrow()
	})

	it('rejects malformed configuration', async () => {
		expect(async () => await createServer({
			config: {
				...defaultConfig,
				sessionSecret: '12345', // too short
			}
		})).rejects.toThrow('sessionSecret')

		expect(async () => await createServer({
			config: {
				...defaultConfig,
				sessionMaxAgeMillis: 'abc', // wrong type
			}
		})).rejects.toThrow('sessionMaxAgeMillis')

		expect(async () => await createServer({
			config: {
				...defaultConfig,
				homepageUrl: 'www.example.org', // wrong format
			}
		})).rejects.toThrow('homepageUrl')

		expect(async () => await createServer({
			config: {
				...defaultConfig,
				apiDomain: 'foo', // not a domain
			}
		})).rejects.toThrow('apiDomain')

		expect(async () => await createServer({
			config: {
				...defaultConfig,
				corsUrls: ['example.org'], // wrong format
			}
		})).rejects.toThrow('corsUrls')

		expect(async () => await createServer({
			config: {
				...defaultConfig,
				sslEnabled: undefined, // absent
			}
		})).rejects.toThrow('sslEnabled')
	})
})
