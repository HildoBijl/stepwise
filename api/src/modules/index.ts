import type { ApiModule } from './types'
import { createUserModule } from './user'
import { authenticationModule } from './authentication'
import { canViewStudentPrivateData, courseModule } from './course'
import { skillModule } from './skill'
import { exerciseModule } from './exercise'
import { groupModule } from './group'
import { groupExerciseModule } from './groupExercise'

// Modules are registered in dependency order. Foundational modules come first.
export const apiModules: ApiModule[] = [
	createUserModule({ privateAccessRules: [canViewStudentPrivateData] }),
	authenticationModule,
	courseModule,
	skillModule,
	exerciseModule,
	groupModule,
	groupExerciseModule,
]

export * from './types'
