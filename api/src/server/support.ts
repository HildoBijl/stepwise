import type { RequestWithSession } from './types.ts'

export function getIdFromRequest(request: RequestWithSession): string | undefined {
	return request.session?.principal?.id
}
