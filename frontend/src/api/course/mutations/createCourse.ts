import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'
import { ensureSetup, serializeSetup } from '@step-wise/skill-setup'

import { USER_PUBLIC_FRAGMENT } from '../../user/fragments.ts'

import type { CreateCourseInput, UseCreateCourseResult } from '../types.ts'
import type { CourseRecord } from '../records.ts'
import { COURSE_INFO_FRAGMENT } from '../fragments.ts'

type CreateCourseData = { createCourse: CourseRecord }
type CreateCourseBlockInput = { name: string; goals: readonly SkillId[] }
type CreateCourseVariables = {
	input: {
		code: string
		name: string
		description?: string
		organization?: string
		goals: CreateCourseInput['specification']['learningGoalIds']
		goalWeights?: CreateCourseInput['specification']['learningGoalWeights']
		startingPoints: CreateCourseInput['specification']['startingPointIds']
		setup?: ReturnType<typeof serializeSetup>
		blocks?: CreateCourseBlockInput[]
	}
}

const CREATE_COURSE_MUTATION: TypedDocumentNode<CreateCourseData, CreateCourseVariables> = gql`
	mutation createCourse($input: CreateCourseInput!) {
		createCourse(input: $input) {
			...CourseInfoFields
			subscription {
				role
				subscribedAt
			}
			teachers {
				...UserPublicFields
			}
			students {
				...UserPublicFields
			}
		}
	}
	${COURSE_INFO_FRAGMENT}
	${USER_PUBLIC_FRAGMENT}
`

export function useCreateCourse(): UseCreateCourseResult {
	const [mutate, { loading, error }] = useMutation(CREATE_COURSE_MUTATION)
	const createCourse = useCallback(async ({ specification, blockNames, ...course }: CreateCourseInput) => {
		const { learningGoalIds: goals, learningGoalWeights: goalWeights, startingPointIds: startingPoints, blockLearningGoalIds, setup } = specification
		const blockGoals = blockLearningGoalIds ?? []
		if (blockNames.length !== blockGoals.length) throw new Error('Invalid course blocks: every block must have exactly one name.')
		const blocks = blockGoals.map((goals, index) => {
			const name = blockNames[index]
			if (name === undefined) throw new Error('Invalid course blocks: a block name is missing.')
			return { name, goals }
		})
		await mutate({
			variables: {
				input: {
					...course,
					goals,
					startingPoints,
					...(goalWeights ? { goalWeights } : {}),
					...(setup === undefined ? {} : { setup: serializeSetup(ensureSetup(setup)) }),
					blocks,
				},
			},
		})
	}, [mutate])
	return [createCourse, { loading, error }]
}
