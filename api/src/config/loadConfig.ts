import type { ApiConfig } from './types'

export function loadConfig(environment: NodeJS.ProcessEnv): ApiConfig {
	const isProduction = environment.NODE_ENV === 'production'
	const isDevelopment = environment.NODE_ENV === 'development'
	const port = readNumber(environment.PORT, 'PORT')
	if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid API configuration: environment variable PORT must be an integer between 0 and 65535.')

	const sessionMaxAgeHours = readNumber(environment.SESSION_MAXAGE_HOURS, 'SESSION_MAXAGE_HOURS', 0)
	return {
		port,
		isProduction,
		isDevelopment,
		server: {
			sslEnabled: isProduction,
			sessionSecret: readRequiredString(environment, 'SESSION_SECRET'),
			sessionMaxAgeMillis: sessionMaxAgeHours * 60 * 60 * 1000,
			homepageUrl: readRequiredString(environment, 'HOMEPAGE_URL'),
			apiDomain: readRequiredString(environment, 'API_DOMAIN'),
			corsUrls: environment.CORS_URLS ? environment.CORS_URLS.split(';') : undefined,
		},
	}
}

function readRequiredString(environment: NodeJS.ProcessEnv, name: string): string {
	const value = environment[name]
	if (!value) throw new Error(`Missing API configuration: environment variable ${name} is required.`)
	return value
}

function readNumber(value: string | undefined, name: string, defaultValue?: number): number {
	if (value === undefined || value === '') {
		if (defaultValue !== undefined) return defaultValue
		throw new Error(`Missing API configuration: environment variable ${name} is required.`)
	}
	const result = Number(value)
	if (!Number.isFinite(result)) throw new Error(`Invalid API configuration: environment variable ${name} must be a number.`)
	return result
}
