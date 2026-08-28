import { expectEquationToEqual } from '../tests/support/wrapperAssertions.ts'

import { asEquation } from './Equation.ts'
import { equationToInputValue, inputValueToEquation } from './inputValue.ts'

describe('equation input-value conversion', () => {
	test('round-trips representative equations', () => {
		for (const equation of ['2*x+3=7', 'x_1+x_2^2+dot(x)_3=0', '(x+y)/z=2', 'sqrt(x^2+1)=y']) {
			const value = asEquation(equation)
			expectEquationToEqual(inputValueToEquation(equationToInputValue(value)), value)
		}
	})

	test('retains interpretation and expression settings', () => {
		const equation = asEquation('xy+sin(x)=1', { allowMultiCharacterVariables: true }, { angleUnit: 'degrees' })
		const restored = inputValueToEquation(equationToInputValue(equation))
		expectEquationToEqual(restored, equation)
		expect(restored.settings.angleUnit).toBe('degrees')
	})
})
