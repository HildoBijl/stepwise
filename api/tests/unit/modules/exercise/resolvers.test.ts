import { describe, expect, it } from 'vitest'

import { type UserSkillRecord, createSkillResolverSource } from '../../../../src/modules/skill/index.ts'
import { exerciseResolvers } from '../../../../src/modules/exercise/resolvers.ts'

describe('exercise resolvers', () => {
	it('only exposes exercise data when the skill grants access', () => {
		const skill = {} as UserSkillRecord

		expect(exerciseResolvers.Skill.exerciseData(createSkillResolverSource(skill, false))).toBeNull()
		expect(exerciseResolvers.Skill.exerciseData(createSkillResolverSource(skill, true))).toBe(skill)
	})
})
