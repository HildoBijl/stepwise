import { describe, expect, it } from 'vitest'

import { ensureModuleId, ensureSkillId, expandModuleIdsWithDirectPrerequisites, expandSkillIdsWithDirectPrerequisitesAndLinks, isModulePrerequisiteOf, sortModuleIdsByTreeOrder } from './searching.ts'

describe('module-tree searching', () => {
	it('validates IDs against the Step-Wise module tree', () => {
		expect(ensureModuleId('demo')).toBe('demo')
		expect(ensureSkillId('demo')).toBe('demo')
		expect(() => ensureSkillId('unknown')).toThrow('Unknown module ID')
	})

	it('expands IDs with their direct prerequisites', () => {
		expect(expandModuleIdsWithDirectPrerequisites(['summationAndMultiplication'])).toEqual(['summationAndMultiplication', 'multiplication', 'summation'])
	})

	it('expands IDs with their direct prerequisites and links', () => {
		expect(expandSkillIdsWithDirectPrerequisitesAndLinks(['substituteAnExpression'])).toEqual(['substituteAnExpression', 'substituteANumber'])
	})

	it('checks transitive prerequisites', () => {
		expect(isModulePrerequisiteOf('rewritePower', 'expandDoubleBrackets')).toBe(true)
		expect(isModulePrerequisiteOf('expandDoubleBrackets', 'rewritePower')).toBe(false)
	})

	it('sorts module IDs into tree order', () => {
		expect(sortModuleIdsByTreeOrder(['expandDoubleBrackets', 'rewritePower'])).toEqual(['rewritePower', 'expandDoubleBrackets'])
	})
})
