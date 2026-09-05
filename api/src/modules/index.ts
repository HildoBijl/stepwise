import type { ApiModule } from './types.ts'
import { createUserModule } from './user/index.ts'
import { authenticationModule } from './authentication/index.ts'
import { canViewStudentSharedData, courseModule } from './course/index.ts'
import { skillModule } from './skill/index.ts'
import { exerciseModule } from './exercise/index.ts'
import { groupModule } from './group/index.ts'
import { groupExerciseModule } from './groupExercise/index.ts'

// Modules are registered in dependency order. Foundational modules come first.
export const apiModules: ApiModule[] = [
	createUserModule({ sharedDataAccessRules: [canViewStudentSharedData] }),
	authenticationModule,
	courseModule,
	skillModule,
	exerciseModule,
	groupModule,
	groupExerciseModule,
]

export * from './types.ts'
