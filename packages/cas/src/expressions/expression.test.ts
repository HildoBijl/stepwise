import { type ExpressionLike, asExpression } from './Expression'

describe('expression substitution', () => {
	test('substitutes one variable', () => {
		expectExpressionToEqual(asExpression('x+2').substitute('x', 3), '3+2')
		expectExpressionToEqual(asExpression('x^2+1').substitute('x', 'y+1'), '(y+1)^2+1')
	})
	test('substitutes multiple variables by list', () => {
		expectExpressionToEqual(asExpression('x+y').substitute(['x', 'y'], [2, 3]), '2+3')
	})
	test('substitutes multiple variables by object', () => {
		expectExpressionToEqual(asExpression('x^2+y').substitute({ x: 2, y: 5 }), '2^2+5')
	})
})

describe('expression evaluation', () => {
	test('evaluates after object substitution', () => {
		expect(asExpression('x^2+3*y').evaluateAt({ x: 2, y: 5 })).toBe(19)
	})
	test('evaluates single-variable expressions directly', () => {
		expect(asExpression('x^2+3').evaluateAt(2)).toBe(7)
	})
	test('throws when variables remain', () => {
		expect(() => asExpression('x+y').evaluateAt(2)).toThrow()
	})
	test('evaluates trigonometry with settings', () => {
		expect(asExpression('sin(90)', {}, { angleUnit: 'degrees' }).evaluateAt({})).toBeCloseTo(1)
	})
})

describe('expression simplification presets', () => {
	test('removes trivial parts', () => {
		expectExpressionToEqual(asExpression('x+0').removeTrivial(), 'x')
		expectExpressionToEqual(asExpression('x*1').removeTrivial(), 'x')
		expectExpressionToEqual(asExpression('-(-x)').removeTrivial(), 'x')
	})
	test('merges numbers', () => {
		expectExpressionToEqual(asExpression('2+x+3').mergeNumbers(), 'x+5')
		expectExpressionToEqual(asExpression('2*x*3').mergeNumbers(), '6*x')
	})
	test('applies cancellations', () => {
		expectExpressionToEqual(asExpression('x-x').cancel(), '0')
		expectExpressionToEqual(asExpression('(x*y)/x').cancel(), 'y')
	})
	test('normalizes expressions', () => {
		expectExpressionToEqual(asExpression('2(2x^2+3x+1)/(x^2-1)').normalize(), '(4x+2)/(x-1)')
	})
})

describe('expression comparison', () => {
	test('handles equivalent expressions with different trigonometric settings', () => {
		expectExpressionToEqual(asExpression('sin(x)', {}, { angleUnit: 'degrees' }), asExpression('sin(x*π/180)', {}, { angleUnit: 'radians' }))
		expectExpressionToEqual(asExpression('arcsin(x)', {}, { angleUnit: 'degrees' }), asExpression('arcsin(x)*180/π', {}, { angleUnit: 'radians' }))
	})
})

describe('expression equivalence', () => {
	test('detects equivalent expressions', () => {
		expect(asExpression('x+1-1').isEquivalentTo('x')).toBe(true)
		expect(asExpression('2*x+3*x').isEquivalentTo('5*x')).toBe(true)
		expect(asExpression('(x*y)/y').isEquivalentTo('x')).toBe(true)
	})
	test('detects non-equivalent expressions', () => {
		expect(asExpression('x+1').isEquivalentTo('x+2')).toBe(false)
	})
})

describe('expression multiple comparisons', () => {
	test('detects constant multiples', () => {
		expect(asExpression('3*x').isConstantMultiple('2*x')).toBe(true)
		expect(asExpression('π*x').isConstantMultiple('x')).toBe(true)
	})
	test('detects integer multiples', () => {
		expect(asExpression('6*x').isIntegerMultiple('2*x')).toBe(true)
		expect(asExpression('3*x').isIntegerMultiple('2*x')).toBe(false)
	})
	test('rejects non-multiples', () => {
		expect(asExpression('x+1').isConstantMultiple('x')).toBe(false)
		expect(asExpression('x^2').isIntegerMultiple('x')).toBe(false)
	})
})

describe('expression derivatives', () => {
	test('differentiates constants and variables', () => {
		expectExpressionToEqual(asExpression('3').differentiate('x'), '0')
		expectExpressionToEqual(asExpression('x').differentiate('x'), '1')
		expectExpressionToEqual(asExpression('y').differentiate('x'), '0')
	})
	test('infers derivative variable', () => {
		expectExpressionToEqual(asExpression('x^2').differentiate(), '2*x^(2-1)')
	})
	test('differentiates sums and products', () => {
		expectExpressionToEqual(asExpression('x^2+3*x').differentiate('x'), '2*x^(2-1)+3')
		expectExpressionToEqual(asExpression('x*y').differentiate('x'), 'y')
	})
	test('differentiates trigonometric functions', () => {
		expectExpressionToEqual(asExpression('sin(x)').differentiate('x'), 'cos(x)')
		expectExpressionToEqual(asExpression('cos(x)').differentiate('x'), '-sin(x)')
	})
})

describe('expression input value conversion', () => {
	test('round-trips expressions through input values', () => {
		const expressions = [
			asExpression('2*x+3'),
			asExpression('x_1+x_2^2+dot(x)_3'),
			asExpression('(x+y)/z'),
			asExpression('sqrt(x^2+1)'),
			asExpression('sin(x)', {}, { angleUnit: 'degrees' }),
		]
		expressions.forEach(expression => {
			expectExpressionToEqual(asExpression(expression.toInputValue()), expression)
		})
	})
	test('round-trips expressions with multi-character variables through input values', () => {
		const expression = asExpression('xy+2*z', { allowMultiCharacterVariables: true })
		expectExpressionToEqual(asExpression(expression.toInputValue()), expression)
	})
})

export function expectExpressionToEqual(result: ExpressionLike, expected: ExpressionLike) {
	const resultValue = asExpression(result)
	const expectedValue = asExpression(expected)
	if (!expectedValue.strictEqualStructure(resultValue)) throw new Error(`An expression was not what was expected.
	Actual output:   ${resultValue.str}
	Expected output: ${expectedValue.str}
	Actual output structure:   ${resultValue.tree}
	Expected output structure: ${expectedValue.tree}`)
}
