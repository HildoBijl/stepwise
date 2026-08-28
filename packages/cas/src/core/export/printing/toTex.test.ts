import { fraction, power, product, sqrt, sum, variable } from '../../construction/index.ts'

import { nodeToTex } from './toTex.ts'

describe('nodeToTex', () => {
	test('prints core mathematical constructs', () => {
		expect(nodeToTex(fraction(1, 2))).toContain('\\frac')
		expect(nodeToTex(sqrt('x'))).toContain('\\sqrt')
		expect(nodeToTex(power('x', 2))).toContain('^{2}')
	})

	test('prints products and bracketed sums', () => {
		const tex = nodeToTex(product(2, sum('x', 1)))
		expect(tex).toContain('2')
		expect(tex).toContain('x')
	})

	test('prints variable subscripts', () => {
		expect(nodeToTex(variable('x', '12'))).toContain('_{12}')
	})
})
