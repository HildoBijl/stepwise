import { prefixList } from './prefixes.ts'

describe('prefix definitions', () => {
	test('have unique string representations', () => {
		const representations = prefixList.flatMap(prefix => [prefix.symbol, ...prefix.aliases])
		expect(new Set(representations).size).toBe(representations.length)
	})
})
import { describe, expect, test } from 'vitest'
