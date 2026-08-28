import { describe, expect, it } from 'vitest'

import { getSkill, skillTree } from './skillTree.ts'

describe('skillTree', () => {
	it('exports the processed Step-Wise skill tree', () => {
		expect(Object.keys(skillTree).length).toBeGreaterThan(0)
		expect(skillTree.demo).toMatchObject({ id: 'demo', name: 'Demo exercise' })
	})
})

describe('getSkill', () => {
	it('returns a known skill', () => {
		expect(getSkill('demo')).toBe(skillTree.demo)
	})

	it('rejects an unknown skill ID', () => {
		expect(() => getSkill('unknown')).toThrow('Unknown skill ID')
	})

	it('optionally allows a case-insensitive match', () => {
		expect(getSkill('DEMO', { allowCaseInsensitiveMatch: true })).toBe(skillTree.demo)
	})
})
