import { combineNumbersInSums } from '../rules/numeric/index.ts'
import { flattenSums } from '../rules/structural/index.ts'

import { adjustSimplificationOptions, allSimplificationOptions, ensureSimplificationOptionSet, isSimplificationOption, resolveSimplificationOptions, resolveSimplificationRules } from './utils.ts'

describe('simplification option utilities', () => {
	test('resolves arrays and preserves valid sets', () => {
		expect(resolveSimplificationOptions(['flattenSums'])).toEqual(new Set(['flattenSums']))
		const options = new Set(['flattenSums'] as const)
		expect(resolveSimplificationOptions(options)).toBe(options)
	})

	test('rejects malformed and unknown options', () => {
		expect(() => resolveSimplificationOptions('flattenSums' as never)).toThrow()
		expect(() => ensureSimplificationOptionSet(new Set(['unknown']))).toThrow('unknown')
		expect(isSimplificationOption('unknown')).toBe(false)
		expect(allSimplificationOptions.has('flattenSums')).toBe(true)
	})

	test('adds and removes options', () => {
		expect(adjustSimplificationOptions(['flattenSums'], ['combineNumbersInSums'], ['flattenSums'])).toEqual(new Set(['combineNumbersInSums']))
	})

	test('resolves option names to their rule objects', () => {
		expect(resolveSimplificationRules(new Set(['flattenSums', 'combineNumbersInSums']))).toEqual(new Set([flattenSums, combineNumbersInSums]))
	})
})
