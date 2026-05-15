import { type ExpressionNodeInput, type VariableInput, Integer, namedConstants, asExpressionNode, negative, variable, sum, product, fraction, power, sqrt, root, ln, log, sin, cos, tan, arcsin, arccos, arctan } from '../construction'
import { getDerivative } from '../operations'

import { expectNodeToEqual } from './testUtils'

const x = variable('x')
const y = variable('y')

function expectDerivativeToGive(input: ExpressionNodeInput, variable: VariableInput, output: ExpressionNodeInput, settings = {}) {
	expectNodeToEqual(getDerivative(asExpressionNode(input), variable, settings), output)
}

describe('derivatives', () => {
	test('differentiates constants and variables', () => {
		expectDerivativeToGive(3, 'x', Integer.zero)
		expectDerivativeToGive(namedConstants.pi, 'x', Integer.zero)
		expectDerivativeToGive(x, 'x', Integer.one)
		expectDerivativeToGive(y, 'x', Integer.zero)
	})

	test('differentiates signs and sums', () => {
		expectDerivativeToGive(negative(power(x, 2)), 'x', negative(product(2, power(x, sum(2, -1)))))
		expectDerivativeToGive(sum(power(x, 2), product(3, x), 2), 'x', sum(product(2, power(x, sum(2, -1))), 3))
	})

	test('differentiates products', () => {
		expectDerivativeToGive(product(x, y), 'x', y)
		expectDerivativeToGive(product(x, x), 'x', sum(x, x))
		expectDerivativeToGive(product(2, power(x, 3)), 'x', product(2, 3, power(x, sum(3, -1))))
		expectDerivativeToGive(product(power(x, 2), power(x, 3), power(x, 4)), 'x', sum(product(2, power(x, sum(2, -1)), power(x, 3), power(x, 4)), product(power(x, 2), 3, power(x, sum(3, -1)), power(x, 4)), product(power(x, 2), power(x, 3), 4, power(x, sum(4, -1)))))
	})

	test('differentiates fractions', () => {
		expectDerivativeToGive(fraction(x, y), 'x', fraction(y, power(y, 2)))
		expectDerivativeToGive(fraction(1, x), 'x', negative(fraction(1, power(x, 2))))
	})

	test('differentiates powers', () => {
		expectDerivativeToGive(power(x, 2), 'x', product(2, power(x, sum(2, -1))))
		expectDerivativeToGive(power(x, 3), 'x', product(3, power(x, sum(3, -1))))
		expectDerivativeToGive(power(x, -3), 'x', negative(product(3, power(x, sum(-3, -1)))))
		expectDerivativeToGive(power(2, x), 'x', product(ln(2), power(2, x)))
		expectDerivativeToGive(power(x, x), 'x', sum(product(x, power(x, sum(x, -1))), product(ln(x), power(x, x))))
	})

	test('differentiates roots', () => {
		expectDerivativeToGive(sqrt(x), 'x', fraction(1, product(2, sqrt(x))))
		expectDerivativeToGive(sqrt(power(x, 2)), 'x', fraction(product(2, power(x, sum(2, -1))), product(2, sqrt(power(x, 2)))))
		expectDerivativeToGive(root(x, 3), 'x', fraction(1, product(3, root(power(x, sum(3, -1)), 3))))
	})

	test('differentiates logarithms', () => {
		expectDerivativeToGive(ln(x), 'x', fraction(1, x))
		expectDerivativeToGive(ln(power(x, 2)), 'x', fraction(product(2, power(x, sum(2, -1))), power(x, 2)))
		expectDerivativeToGive(log(x, 10), 'x', fraction(1, product(x, ln(10))))
	})

	test('differentiates trigonometric functions', () => {
		expectDerivativeToGive(sin(x), 'x', cos(x))
		expectDerivativeToGive(cos(x), 'x', negative(sin(x)))
		expectDerivativeToGive(tan(x), 'x', fraction(1, power(cos(x), 2)))
		expectDerivativeToGive(sin(power(x, 2)), 'x', product(cos(power(x, 2)), 2, power(x, sum(2, -1))))
	})

	test('differentiates inverse trigonometric functions', () => {
		expectDerivativeToGive(arcsin(x), 'x', fraction(1, sqrt(sum(1, negative(power(x, 2))))))
		expectDerivativeToGive(arccos(x), 'x', negative(fraction(1, sqrt(sum(1, negative(power(x, 2)))))))
		expectDerivativeToGive(arctan(x), 'x', fraction(1, sum(1, power(x, 2))))
	})

	test('uses degree factors for trigonometry', () => {
		expectDerivativeToGive(sin(x), 'x', product(cos(x), fraction(namedConstants.pi, 180)), { degrees: true })
		expectDerivativeToGive(arcsin(x), 'x', product(fraction(1, sqrt(sum(1, negative(power(x, 2))))), fraction(180, namedConstants.pi)), { degrees: true })
	})
})
