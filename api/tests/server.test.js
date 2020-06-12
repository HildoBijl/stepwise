const { createServer } = require('../src/server/index')
const { defaultConfig } = require('./client')

describe('createServer', () => {
	it('accepts well-formed configuration', () => {
		expect(() => createServer({
			config: defaultConfig
		})).not.toThrow()

		expect(() => createServer({
			config: {
				sslEnabled: false,
				sessionSecret: '12345678901234567890',
				sessionMaxAgeMillis: 24,
				homepageUrl: 'https://www.example.org/home',
				corsUrls: ['https://www.example.org'],
			}
		})).not.toThrow()
	})

	it('rejects malformed configuration', () => {
		expect(() => createServer({
			config: {
				...defaultConfig,
				sessionSecret: '12345', // too short
			}
		})).toThrow('sessionSecret')

		expect(() => createServer({
			config: {
				...defaultConfig,
				sessionMaxAgeMillis: 'abc', // wrong type
			}
		})).toThrow('sessionMaxAgeMillis')

		expect(() => createServer({
			config: {
				...defaultConfig,
				homepageUrl: 'www.example.org', // wrong format
			}
		})).toThrow('homepageUrl')

		expect(() => createServer({
			config: {
				...defaultConfig,
				corsUrls: ['example.org'], // wrong format
			}
		})).toThrow('corsUrls')

		expect(() => createServer({
			config: {
				...defaultConfig,
				sslEnabled: undefined, // absent
			}
		})).toThrow('sslEnabled')
	})
})
