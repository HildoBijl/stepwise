import type { AuthenticatedContext } from '../../user/index.ts'

export type GroupExerciseContext = Pick<AuthenticatedContext, 'db' | 'ensureSignedIn' | 'pubsub' | 'userId'>
export type GroupExerciseStartedArgs = { code: string; skillId: string }
export type GroupExerciseSubscriptionArgs = { exerciseId: string }
