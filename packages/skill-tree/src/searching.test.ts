import { describe, expect, it } from 'vitest'

import { ensureSkillId, expandSkillIdsWithDirectPrerequisites, expandSkillIdsWithDirectPrerequisitesAndLinks, isSkillPrerequisiteOf } from './searching.ts'

describe('skill-tree searching', () => {
	it('validates IDs against the Step-Wise skill tree', () => {
		expect(ensureSkillId('demo')).toBe('demo')
		expect(() => ensureSkillId('unknown')).toThrow('Unknown skill ID')
	})

	it('expands IDs with their direct prerequisites', () => {
		expect(expandSkillIdsWithDirectPrerequisites(['summationAndMultiplication'])).toEqual(['summationAndMultiplication', 'multiplication', 'summation'])
	})

	it('expands IDs with their direct prerequisites and links', () => {
		expect(expandSkillIdsWithDirectPrerequisitesAndLinks(['substituteAnExpression'])).toEqual(['substituteAnExpression', 'substituteANumber'])
	})

	it('checks transitive prerequisites', () => {
		expect(isSkillPrerequisiteOf('rewritePower', 'expandDoubleBrackets')).toBe(true)
		expect(isSkillPrerequisiteOf('expandDoubleBrackets', 'rewritePower')).toBe(false)
	})
})
