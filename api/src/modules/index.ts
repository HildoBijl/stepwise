import type { ApiModule } from './types'
import { userModule } from './user'

// Modules are registered in dependency order. Foundational modules come first.
export const apiModules: ApiModule[] = [userModule]

export * from './compose'
export * from './types'
