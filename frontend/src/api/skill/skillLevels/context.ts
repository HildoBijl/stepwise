import { createContext, useContext } from 'react'

import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

export interface SkillLevelContextValue {
	skillLevelSet: SkillLevelSet
	registerSkillLevels: (skillIds: readonly SkillId[]) => () => void
}

export const SkillLevelContext = createContext<SkillLevelContextValue | undefined>(undefined)

export function useSkillLevelContext(): SkillLevelContextValue {
	const context = useContext(SkillLevelContext)
	if (!context) throw new Error('Skill-level hooks must be used within a SkillLevelProvider.')
	return context
}
