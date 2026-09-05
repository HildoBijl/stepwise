import { useEffect, useSyncExternalStore } from 'react'

import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import { useConsistentValue } from 'util/index'

import { useSkillLevelContext } from './context.ts'

export function useSkillLevelSet(): SkillLevelSet {
	return useSkillLevelContext().skillLevelSet
}

function useSkillLevelRegistration(skillIds: readonly SkillId[]): void {
	const consistentSkillIds = useConsistentValue(skillIds) as readonly SkillId[]
	const { registerSkillLevels } = useSkillLevelContext()
	useEffect(() => registerSkillLevels(consistentSkillIds), [consistentSkillIds, registerSkillLevels])
}

export function useSkillLevels(skillIds: readonly SkillId[]): SkillLevelSet {
	useSkillLevelRegistration(skillIds)
	const skillLevelSet = useSkillLevelSet()
	useSyncExternalStore(listener => skillLevelSet.subscribe(listener), () => skillLevelSet.getSnapshot())
	return skillLevelSet
}

export function useSkillLevel(skillId?: SkillId): SkillLevelSet {
	return useSkillLevels(skillId === undefined ? [] : [skillId])
}
