import type { RequestWithSession } from './types.ts'

export function getSessionUserId(request: RequestWithSession): string | undefined {
	return request.session?.principal?.id
}
