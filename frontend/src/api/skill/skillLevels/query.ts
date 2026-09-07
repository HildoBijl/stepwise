import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'
import { ensureSkillIds } from '@step-wise/skill-tree'

import { useUser } from '../../user/index.ts'

import type { SkillLevelRecord } from '../records.ts'
import { skillLevelFields } from '../fragments.ts'
import { skillLevelRecordToData } from '../conversion.ts'

export type SkillLevelRecordsQueryData = { skills: SkillLevelRecord[] }
export type SkillLevelRecordsQueryVariables = { skillIds: SkillId[] }

const SKILL_LEVEL_RECORDS_QUERY: TypedDocumentNode<SkillLevelRecordsQueryData, SkillLevelRecordsQueryVariables> = gql`
	query skillLevelRecords($skillIds: [String]!) {
		skills(skillIds: $skillIds) {
			${skillLevelFields}
		}
	}
`

export function useSkillLevelRecordsQuery(skillIds: SkillId[]) {
	skillIds = [...ensureSkillIds(skillIds)]
	const user = useUser()
	const skip = !user || skillIds.length === 0
	const result = useQuery(SKILL_LEVEL_RECORDS_QUERY, { variables: { skillIds }, skip })
	const rawData = result.data as SkillLevelRecordsQueryData | undefined
	const data = useMemo(() => rawData ? { skills: rawData.skills.map(skillLevelRecordToData) } : undefined, [rawData])
	return { ...result, data }
}
