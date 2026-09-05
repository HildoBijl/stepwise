import { describe, expect, it } from 'vitest'

import type { UserSkillRecord } from '../../../../src/modules/skill/index.ts'
import { exerciseResolvers } from '../../../../src/modules/exercise/resolvers.ts'

describe('exercise resolvers', () => {
	it('only exposes exercise data when the skill grants access', () => {
		const inaccessibleSkill = { mayViewExerciseData: false } as UserSkillRecord
		const accessibleSkill = { mayViewExerciseData: true } as UserSkillRecord

		expect(exerciseResolvers.Skill.exerciseData(inaccessibleSkill)).toBeNull()
		expect(exerciseResolvers.Skill.exerciseData(accessibleSkill)).toBe(accessibleSkill)
	})
})
