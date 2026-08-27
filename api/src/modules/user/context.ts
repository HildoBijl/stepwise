import type { ApiContext } from '../types.ts'

import type { UserRecord } from './models.ts'

export type AuthenticatedContext = ApiContext & {
	userId: string
	user: UserRecord
}
