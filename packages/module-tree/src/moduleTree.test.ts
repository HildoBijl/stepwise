import { describe, expect, it } from 'vitest'

import { getModule, getSkill, moduleTree } from './moduleTree.ts'

describe('moduleTree', () => {
	it('exports the processed Step-Wise module tree', () => {
		expect(Object.keys(moduleTree).length).toBeGreaterThan(0)
		expect(moduleTree.demo).toMatchObject({ id: 'demo', name: 'Demo exercise' })
	})
})

describe('getSkill', () => {
	it('returns a known skill', () => {
		expect(getSkill('demo')).toBe(moduleTree.demo)
	})

	it('rejects an unknown skill ID', () => {
		expect(() => getSkill('unknown')).toThrow('Unknown module ID')
	})

	it('optionally allows a case-insensitive match', () => {
		expect(getSkill('DEMO', { allowCaseInsensitiveMatch: true })).toBe(moduleTree.demo)
	})
})

describe('getModule', () => {
	it('returns a known module', () => {
		expect(getModule('demo')).toBe(moduleTree.demo)
	})
})
