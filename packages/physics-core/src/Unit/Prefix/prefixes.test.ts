import { prefixList } from './prefixes'

describe('prefix definitions', () => {
	test('have unique string representations', () => {
		const representations = prefixList.flatMap(prefix => [prefix.letter, ...prefix.alternatives])
		expect(new Set(representations).size).toBe(representations.length)
	})
})
