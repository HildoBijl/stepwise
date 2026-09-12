import type { AuthenticatedContext } from '../../user/index.ts'

export type ExerciseContext = Pick<AuthenticatedContext, 'db' | 'ensureSignedIn' | 'loaders' | 'pubsub' | 'userId'>
export type ExerciseStartedArgs = { skillId: string }
export type ExerciseUpdatedArgs = { exerciseId: string }
