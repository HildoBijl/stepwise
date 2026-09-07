import { type ReactNode, createContext, useContext, useMemo } from 'react'
import { useQuery } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'
import { sortBy } from '@step-wise/js-utils'

import { useUserId } from '../user/index.ts'

import type { ActiveGroupExercisesState, ActiveGroupState, GroupExercise, GroupMember } from './types.ts'
import { MY_ACTIVE_GROUP_QUERY } from './groupQueries.ts'
import { useMyActiveGroupSubscription } from './groupSubscriptions.ts'
import { useActiveGroupExercisesQuery } from './exerciseQueries.ts'
import { useActiveGroupExercisesSubscription } from './exerciseSubscriptions.ts'
import { groupExerciseRecordToExercise, groupRecordToGroup } from './conversion.ts'

type ActiveGroupContextValue = {
	activeGroup: ActiveGroupState
	activeGroupExercises: ActiveGroupExercisesState
}

const ActiveGroupContext = createContext<ActiveGroupContextValue | undefined>(undefined)

export function ActiveGroupProvider({ children }: { children: ReactNode }) {
	const userId = useUserId()
	const activeGroupQuery = useQuery(MY_ACTIVE_GROUP_QUERY, { skip: !userId })
	useMyActiveGroupSubscription(activeGroupQuery.subscribeToMore, !!userId)

	const activeGroupRecord = activeGroupQuery.data?.myActiveGroup
	const currentMember = activeGroupRecord?.members.find(member => member.userId === userId)
	const group = useMemo(() => currentMember?.active && activeGroupRecord ? groupRecordToGroup(activeGroupRecord) : undefined, [activeGroupRecord, currentMember?.active])

	const exercisesQuery = useActiveGroupExercisesQuery(group?.code, !!group)
	useActiveGroupExercisesSubscription(group?.code, exercisesQuery.subscribeToMore, !!group)
	const exerciseRecords = exercisesQuery.data?.activeGroupExercises
	const exercises = useMemo(() => exerciseRecords?.map(groupExerciseRecordToExercise), [exerciseRecords])

	const value = useMemo<ActiveGroupContextValue>(() => ({
		activeGroup: { group, loading: activeGroupQuery.loading, error: activeGroupQuery.error },
		activeGroupExercises: { exercises, loading: exercisesQuery.loading, error: exercisesQuery.error },
	}), [activeGroupQuery.error, activeGroupQuery.loading, exercises, exercisesQuery.error, exercisesQuery.loading, group])

	return <ActiveGroupContext.Provider value={value}>{children}</ActiveGroupContext.Provider>
}

function useActiveGroupContext(): ActiveGroupContextValue {
	const context = useContext(ActiveGroupContext)
	if (!context) throw new Error('Active-group hooks must be used within an ActiveGroupProvider.')
	return context
}

export function useActiveGroupState(): ActiveGroupState {
	return useActiveGroupContext().activeGroup
}

export function useActiveGroup() {
	return useActiveGroupState().group
}

export function useActiveGroupExercisesState(): ActiveGroupExercisesState {
	return useActiveGroupContext().activeGroupExercises
}

export function useActiveGroupExercises(): GroupExercise[] | undefined {
	return useActiveGroupExercisesState().exercises
}

export function useActiveGroupExercise(skillId: SkillId): GroupExercise | undefined {
	return useActiveGroupExercises()?.find(exercise => exercise.skillId === skillId)
}

export function useOtherGroupMembers(members: GroupMember[]): GroupMember[] {
	const userId = useUserId()
	return useMemo(() => {
		const otherMembers = members.filter(member => member.userId !== userId)
		const groups = [otherMembers.filter(member => member.active), otherMembers.filter(member => !member.active)]
		const activity = groups.map(group => group.map(member => member.lastActivity.getTime()))
		return groups.flatMap((group, index) => sortBy(group, activity[index] ?? [], { order: 'descending' }))
	}, [members, userId])
}

export function useSortedGroupMembers(members: GroupMember[]): GroupMember[] {
	const userId = useUserId()
	const otherMembers = useOtherGroupMembers(members)
	const user = members.find(member => member.userId === userId)
	return useMemo(() => user ? [user, ...otherMembers] : otherMembers, [otherMembers, user])
}
