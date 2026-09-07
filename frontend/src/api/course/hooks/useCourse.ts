import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_PUBLIC_FRAGMENT, USER_SHARED_DATA_FRAGMENT } from '../../user/fragments.ts'
import { skillLevelFields } from '../../skill/fragments.ts'

import type { UseCourseResult } from '../types.ts'
import type { CourseWithStudentSkillsRecord } from '../records.ts'
import { COURSE_INFO_FRAGMENT } from '../fragments.ts'
import { courseWithStudentSkillsRecordToCourseInfo } from '../conversion.ts'

type CourseQueryData = { course: CourseWithStudentSkillsRecord }
type CourseQueryVariables = { code: string }

export function useCourse(code?: string): UseCourseResult {
	const { data, loading, error } = useQuery(COURSE_QUERY, {
		variables: { code: code ?? '' },
		skip: !code,
	})
	const record = (data as CourseQueryData | undefined)?.course
	const course = useMemo(() => record ? courseWithStudentSkillsRecordToCourseInfo(record) : undefined, [record])
	return { course, loading, error }
}

const COURSE_QUERY: TypedDocumentNode<CourseQueryData, CourseQueryVariables> = gql`
	query course($code: String!) {
		course(code: $code) {
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
				sharedData {
					...UserSharedDataFields
					skills {
						${skillLevelFields}
					}
				}
			}
		}
	}
	${COURSE_INFO_FRAGMENT}
	${USER_PUBLIC_FRAGMENT}
	${USER_SHARED_DATA_FRAGMENT}
`
