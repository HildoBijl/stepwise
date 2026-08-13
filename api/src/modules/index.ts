import type { ApiModule } from './types'
import { authenticationModule } from './authentication'
import { courseModule } from './course'
import { exerciseModule } from './exercise'
import { groupModule } from './group'
import { groupExerciseModule } from './groupExercise'
import { skillModule } from './skill'
import { userModule } from './user'

// Modules are registered in dependency order. Foundational modules come first.
export const apiModules: ApiModule[] = [userModule, authenticationModule, courseModule, skillModule, exerciseModule, groupModule, groupExerciseModule]

export * from './compose'
export * from './types'
