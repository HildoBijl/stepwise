import { useCallback } from 'react'
import { type ApolloCache, type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { ExerciseAction } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

import type { UseCancelGroupActionResult, UseResolveGroupEventResult, UseStartGroupExerciseResult, UseSubmitGroupActionResult } from './types.ts'
import type { GroupExerciseRecord } from './records.ts'
import { groupExerciseFields } from './fragments.ts'
import { ACTIVE_GROUP_EXERCISES_QUERY } from './query.ts'
import { addGroupExerciseToList } from './reconciliation.ts'

type GroupExerciseMutationData<Key extends string> = Record<Key, GroupExerciseRecord>
type GroupExerciseVariables = { code: string; skillId: SkillId }
type SubmitGroupActionVariables = GroupExerciseVariables & { action: ExerciseAction }

const START_GROUP_EXERCISE: TypedDocumentNode<GroupExerciseMutationData<'startGroupExercise'>, GroupExerciseVariables> = gql`
	mutation startGroupExercise($code: String!, $skillId: String!) {
		startGroupExercise(code: $code, skillId: $skillId) {
			${groupExerciseFields}
		}
	}
`

const SUBMIT_GROUP_ACTION: TypedDocumentNode<GroupExerciseMutationData<'submitGroupAction'>, SubmitGroupActionVariables> = gql`
	mutation submitGroupAction($code: String!, $skillId: String!, $action: JSON!) {
		submitGroupAction(code: $code, skillId: $skillId, action: $action) {
			${groupExerciseFields}
		}
	}
`

const CANCEL_GROUP_ACTION: TypedDocumentNode<GroupExerciseMutationData<'cancelGroupAction'>, GroupExerciseVariables> = gql`
	mutation cancelGroupAction($code: String!, $skillId: String!) {
		cancelGroupAction(code: $code, skillId: $skillId) {
			${groupExerciseFields}
		}
	}
`

const RESOLVE_GROUP_EVENT: TypedDocumentNode<GroupExerciseMutationData<'resolveGroupEvent'>, GroupExerciseVariables> = gql`
	mutation resolveGroupEvent($code: String!, $skillId: String!) {
		resolveGroupEvent(code: $code, skillId: $skillId) {
			${groupExerciseFields}
		}
	}
`

function updateExerciseInCache(cache: ApolloCache, code: string, updatedExercise: GroupExerciseRecord): void {
	const exercises = cache.readQuery({ query: ACTIVE_GROUP_EXERCISES_QUERY, variables: { code } })?.activeGroupExercises
	if (!exercises) return
	cache.writeQuery({
		query: ACTIVE_GROUP_EXERCISES_QUERY,
		variables: { code },
		data: { activeGroupExercises: addGroupExerciseToList(updatedExercise, exercises) },
	})
}

export function useStartGroupExercise(code: string, skillId: SkillId): UseStartGroupExerciseResult {
	const [mutate, { loading, error }] = useMutation(START_GROUP_EXERCISE, {
		variables: { code, skillId },
		update(cache, { data }) {
			if (data?.startGroupExercise) updateExerciseInCache(cache, code, data.startGroupExercise)
		},
	})
	const startGroupExercise = useCallback(async () => { await mutate() }, [mutate])
	return [startGroupExercise, { loading, error }]
}

export function useSubmitGroupAction(code: string, skillId: SkillId): UseSubmitGroupActionResult {
	const [mutate, { loading, error }] = useMutation(SUBMIT_GROUP_ACTION)
	const submitGroupAction = useCallback(async (action: ExerciseAction) => {
		await mutate({
			variables: { code, skillId, action },
			update(cache, { data }) {
				if (data?.submitGroupAction) updateExerciseInCache(cache, code, data.submitGroupAction)
			},
		})
	}, [code, mutate, skillId])
	return [submitGroupAction, { loading, error }]
}

export function useCancelGroupAction(code: string, skillId: SkillId): UseCancelGroupActionResult {
	const [mutate, { loading, error }] = useMutation(CANCEL_GROUP_ACTION, {
		variables: { code, skillId },
		update(cache, { data }) {
			if (data?.cancelGroupAction) updateExerciseInCache(cache, code, data.cancelGroupAction)
		},
	})
	const cancelGroupAction = useCallback(async () => { await mutate() }, [mutate])
	return [cancelGroupAction, { loading, error }]
}

export function useResolveGroupEvent(code: string, skillId: SkillId): UseResolveGroupEventResult {
	const [mutate, { loading, error }] = useMutation(RESOLVE_GROUP_EVENT, {
		variables: { code, skillId },
		update(cache, { data }) {
			if (data?.resolveGroupEvent) updateExerciseInCache(cache, code, data.resolveGroupEvent)
		},
	})
	const resolveGroupEvent = useCallback(async () => { await mutate() }, [mutate])
	return [resolveGroupEvent, { loading, error }]
}
