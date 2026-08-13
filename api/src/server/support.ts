import type { Request } from 'express'

import type { CreateServerOptions } from './types'

type RequestWithSession = Pick<Request, 'session'>

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

export function validateConfig(config: unknown): void {
	const value = config as Partial<CreateServerOptions['config']> | null
	if (typeof value?.sslEnabled !== 'boolean') throw new Error('Invalid server configuration: sslEnabled must be a boolean.')
	if (typeof value.sessionSecret !== 'string' || value.sessionSecret.length < 20) throw new Error('Invalid server configuration: sessionSecret must contain at least 20 characters.')
	if (typeof value.sessionMaxAgeMillis !== 'number') throw new Error('Invalid server configuration: sessionMaxAgeMillis must be a number.')
	if (!isUrl(value.homepageUrl)) throw new Error('Invalid server configuration: homepageUrl must be a URL.')
	if (!isDomain(value.apiDomain)) throw new Error('Invalid server configuration: apiDomain must be a domain.')
	if (value.corsUrls !== undefined && (!Array.isArray(value.corsUrls) || !value.corsUrls.every(isUrl))) throw new Error('Invalid server configuration: corsUrls must contain only URLs.')
}

export function getIdFromRequest(request: RequestWithSession): string | undefined {
	return request.session?.principal?.id
}
