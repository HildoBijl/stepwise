import type { RequestWithSession } from './types.js'

export function getIdFromRequest(request: RequestWithSession): string | undefined {
	return request.session?.principal?.id
}
