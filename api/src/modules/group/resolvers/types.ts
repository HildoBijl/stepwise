import type { PubSubEngine } from 'graphql-subscriptions'
import type { Transaction } from 'sequelize'

import type { ApiContext } from '../../types.ts'
import type { AuthenticatedContext } from '../../user/index.ts'

import type { GroupWithMembers } from '../models.ts'

export type GroupContext = Pick<ApiContext, 'db'>
export type AuthenticatedGroupContext = Pick<AuthenticatedContext, 'db' | 'ensureSignedIn' | 'pubsub' | 'userId'>
export type CleanUpGroupMember = (db: AuthenticatedGroupContext['db'], group: GroupWithMembers, userId: string, transaction: Transaction, pubsub: PubSubEngine) => Promise<() => Promise<void>>
