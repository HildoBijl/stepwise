import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { ExerciseAction } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

import type { GroupExerciseRecord } from '../records.ts'
import type { UseSubmitGroupActionResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'

import { updateLatestGroupExerciseInCache } from './cache.ts'

type SubmitGroupActionData = { submitGroupAction: GroupExerciseRecord }
type SubmitGroupActionVariables = { code: string; skillId: SkillId; action: ExerciseAction }

const SUBMIT_GROUP_ACTION_MUTATION: TypedDocumentNode<SubmitGroupActionData, SubmitGroupActionVariables> = gql`
	mutation submitGroupAction($code: String!, $skillId: String!, $action: JSON!) {
		submitGroupAction(code: $code, skillId: $skillId, action: $action) {
			${groupExerciseFields}
		}
	}
`

export function useSubmitGroupAction(code: string, skillId: SkillId): UseSubmitGroupActionResult {
	const [mutate, { loading, error }] = useMutation(SUBMIT_GROUP_ACTION_MUTATION)
	const submitGroupAction = useCallback(async (action: ExerciseAction) => {
		await mutate({
			variables: { code, skillId, action },
			update(cache, { data }) {
				if (data?.submitGroupAction) updateLatestGroupExerciseInCache(cache, code, skillId, data.submitGroupAction)
			},
		})
	}, [code, mutate, skillId])
	return [submitGroupAction, { loading, error }]
}
