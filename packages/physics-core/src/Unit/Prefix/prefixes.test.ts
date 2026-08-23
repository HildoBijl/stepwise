import { prefixList } from './prefixes'

describe('prefix definitions', () => {
	test('have unique string representations', () => {
		const representations = prefixList.flatMap(prefix => [prefix.symbol, ...prefix.aliases])
		expect(new Set(representations).size).toBe(representations.length)
	})
})
