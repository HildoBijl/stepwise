import type { RequestWithSession } from './types'

export function getIdFromRequest(request: RequestWithSession): string | undefined {
	return request.session?.principal?.id
}
