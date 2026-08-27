import type { ApiContext } from '../types.ts'

import type { UserRecord } from './model.ts'

export type AuthenticatedContext = ApiContext & {
	userId: string
	user: UserRecord
}
