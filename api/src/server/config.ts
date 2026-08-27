import type { ApiConfig, ServerConfig } from './types.ts'

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
			...(environment.CORS_URLS ? { corsUrls: environment.CORS_URLS.split(';') } : {}),
		},
	}
}

export function validateServerConfig(config: unknown): void {
	const value = config as Partial<ServerConfig> | null
	if (typeof value?.sslEnabled !== 'boolean') throw new Error('Invalid server configuration: sslEnabled must be a boolean.')
	if (typeof value.sessionSecret !== 'string' || value.sessionSecret.length < 20) throw new Error('Invalid server configuration: sessionSecret must contain at least 20 characters.')
	if (typeof value.sessionMaxAgeMillis !== 'number') throw new Error('Invalid server configuration: sessionMaxAgeMillis must be a number.')
	if (!isUrl(value.homepageUrl)) throw new Error('Invalid server configuration: homepageUrl must be a URL.')
	if (!isDomain(value.apiDomain)) throw new Error('Invalid server configuration: apiDomain must be a domain.')
	if (value.corsUrls !== undefined && (!Array.isArray(value.corsUrls) || !value.corsUrls.every(isUrl))) throw new Error('Invalid server configuration: corsUrls must contain only URLs.')
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

function isUrl(value: unknown): value is string {
	if (typeof value !== 'string') return false
	try {
		return ['http:', 'https:'].includes(new URL(value).protocol)
	} catch {
		return false
	}
}

function isDomain(value: unknown): value is string {
	return typeof value === 'string' && (value === 'localhost' || /^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,}$/i.test(value))
}
