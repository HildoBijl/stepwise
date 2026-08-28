import { asExpression } from '../expressions/index.ts'
import { expectEquationToEqual } from '../tests/support/wrapperAssertions.ts'

import { Equation, asEquation } from './Equation.ts'

describe('Equation', () => {
	test('coerces strings and constructs equations from expressions', () => {
		expectEquationToEqual(asEquation('2x=6'), new Equation(asExpression('2x'), asExpression(6)))
		expectEquationToEqual(asEquation({ left: 'x+1', right: 2 }), 'x+1=2')
	})

	test('maps and switches sides', () => {
		expectEquationToEqual(asEquation('x=3').mapLeft(side => side.add(1)), 'x+1=3')
		expectEquationToEqual(asEquation('x=3').mapRight(side => side.add(1)), 'x=3+1')
		expectEquationToEqual(asEquation('x=3').switchSides(), '3=x')
	})

	test('applies arithmetic and simplification to both sides', () => {
		expectEquationToEqual(asEquation('x=3').add(2), 'x+2=3+2')
		expectEquationToEqual(asEquation('x=3').subtract(2), 'x-2=3-2')
		expectEquationToEqual(asEquation('x=3').multiply(2), 'x*2=3*2')
		expectEquationToEqual(asEquation('x=3').divide(2), 'x/2=3/2')
		expectEquationToEqual(asEquation('x+0=2+3').mergeNumbers().removeTrivial(), 'x=5')
	})

	test('substitutes simultaneously on both sides', () => {
		expectEquationToEqual(asEquation('x+y=y').substitute(['x', 'y'], ['y', 'z']), 'y+z=z')
		expectEquationToEqual(asEquation('x^2+y=9').substitute({ x: 2, y: 5 }), '2^2+5=9')
	})

	test('evaluates equations and rejects remaining variables', () => {
		expect(asEquation('x+y=5').evaluateAt({ x: 2, y: 3 })).toBe(true)
		expect(asEquation('x^2+3=8').evaluateAt(2)).toBe(false)
		expect(() => asEquation('x+y=5').evaluateAt(2)).toThrow()
	})

	test('collects unique variables and checks properties', () => {
		expect(asEquation('x+y=x').collectVariables().map(variable => variable.str)).toEqual(['x', 'y'])
		expect(asEquation('x+2=5').dependsOn('x')).toBe(true)
		expect(asEquation('2+3=5').isNumeric()).toBe(true)
	})

	test('maps all expressions while retaining equation settings', () => {
		const equation = asEquation('sin(x)=y', undefined, { angleUnit: 'degrees' })
		const mapped = equation.mapExpressions(expression => expression.isVariable() && expression.symbol === 'x'
			? asExpression('sin(1)', undefined, { angleUnit: 'radians' })
			: expression)
		expect(mapped.settings.angleUnit).toBe('degrees')
		expect(mapped.left.settings.angleUnit).toBe('degrees')
		expect(mapped.right.settings.angleUnit).toBe('degrees')
	})

	test('infers compatible interpretation settings and rejects conflicts', () => {
		expect(() => asEquation('e=x').inferInterpretationSettings()).not.toThrow()
		const conflicting = new Equation(asExpression('e'), asExpression('e', { interpretEAsConstant: false }))
		expect(() => conflicting.inferInterpretationSettings()).toThrow()
	})
})
