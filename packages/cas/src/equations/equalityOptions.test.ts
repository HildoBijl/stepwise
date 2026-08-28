import { asExpression } from '../expressions/index.ts'

import { asEquation } from './Equation.ts'
import { asEquationEqualityOptions, defaultEquationEqualityOptions, getEquationPreprocessor } from './equalityOptions.ts'

describe('equation equality options', () => {
	test('resolves defaults and overrides', () => {
		expect(asEquationEqualityOptions()).toEqual(defaultEquationEqualityOptions)
		expect(asEquationEqualityOptions({ allowSideSwitch: false }).allowSideSwitch).toBe(false)
		expect(asEquationEqualityOptions({ allowNegatingBothSides: true }).allowNegatingBothSides).toBe(true)
	})

	test('preprocesses the equation and individual sides', () => {
		const preprocess = getEquationPreprocessor({
			preprocess: equation => equation.add(0),
			preprocessLeft: side => side.removeTrivial(),
			preprocessRight: side => side.mergeNumbers(),
		})
		const result = preprocess(asEquation('x+0=2+3'))
		expect(result.left.strictEqualStructure(asExpression('x'))).toBe(true)
		expect(result.right.strictEqualStructure(asExpression('5'))).toBe(true)
	})

	test('rejects conflicting side preprocessors', () => {
		const preprocess = getEquationPreprocessor({ preprocessSide: side => side, preprocessLeft: side => side })
		expect(() => preprocess(asEquation('x=1'))).toThrow('cannot define both preprocessSide')
	})

	test('supports separate comparison callbacks in the documented argument order', () => {
		const calls: string[] = []
		const result = asEquation('x=1').equals('y=2', {
			allowSideSwitch: false,
			compareLeft: (input, expected) => { calls.push(`${input.str}:${expected.str}`); return true },
			compareRight: (input, expected) => { calls.push(`${input.str}:${expected.str}`); return true },
		})
		expect(result).toBe(true)
		expect(calls).toEqual(['y:x', '2:1'])
	})
})
