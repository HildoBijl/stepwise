import type { ApiMutationResult, ApiOperationState, ApiQueryResult } from '../types.ts'

export type GroupMember = {
	groupId: string
	userId: string
	name?: string
	givenName?: string
	familyName?: string
	active: boolean
	lastActivity: Date
}

export type Group = {
	code: string
	members: GroupMember[]
}

export type UseGroupExistsResult = ApiQueryResult<'exists', boolean>
export type UseMyGroupsResult = ApiQueryResult<'groups', Group[]>
export type UseMyActiveGroupResult = ApiQueryResult<'group', Group>

export type UseCreateGroupResult = ApiMutationResult<() => Promise<void>>
export type UseJoinGroupResult = ApiMutationResult<(code: string) => Promise<void>>
export type UseLeaveGroupResult = ApiMutationResult<() => Promise<void>>
export type UseActivateGroupResult = ApiMutationResult<() => Promise<void>>
export type UseDeactivateGroupResult = ApiMutationResult<() => Promise<void>>

export type ActiveGroupState = ApiOperationState & { group: Group | undefined }
