import type { ApiModule } from './types'
import { authenticationModule } from './authentication'
import { userModule } from './user'
import { courseModule } from './course'
import { skillModule } from './skill'
import { exerciseModule } from './exercise'
import { groupModule } from './group'
import { groupExerciseModule } from './groupExercise'

// Modules are registered in dependency order. Foundational modules come first.
export const apiModules: ApiModule[] = [userModule, authenticationModule, courseModule, skillModule, exerciseModule, groupModule, groupExerciseModule]

export * from './types'
