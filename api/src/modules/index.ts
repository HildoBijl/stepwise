import type { ApiModule } from './types.js'
import { createUserModule } from './user/index.js'
import { authenticationModule } from './authentication/index.js'
import { canViewStudentPrivateData, courseModule } from './course/index.js'
import { skillModule } from './skill/index.js'
import { exerciseModule } from './exercise/index.js'
import { groupModule } from './group/index.js'
import { groupExerciseModule } from './groupExercise/index.js'

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

export * from './types.js'
