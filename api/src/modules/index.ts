import type { ApiModule } from './types'
import { skillModule } from './skill'
import { userModule } from './user'

// Modules are registered in dependency order. Foundational modules come first.
export const apiModules: ApiModule[] = [userModule, skillModule]

export * from './compose'
export * from './types'
