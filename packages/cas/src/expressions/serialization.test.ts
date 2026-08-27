import { asExpression } from './Expression'
import { deserializeExpression, serializeExpression } from './serialization'

describe('expression serialization', () => {
	test('round-trips storage and wrapper settings', () => {
		const expression = asExpression('sin(x)+1', undefined, { angleUnit: 'degrees' })
		const restored = deserializeExpression(serializeExpression(expression))
		expect(restored.strictEqualStructure(expression)).toBe(true)
		expect(restored.settings).toEqual(expression.settings)
	})

	test('omits default settings and retains non-default settings', () => {
		expect(serializeExpression(asExpression('x'))).not.toHaveProperty('settings')
		expect(serializeExpression(asExpression('sin(x)', undefined, { angleUnit: 'degrees' })).settings).toEqual({ angleUnit: 'degrees' })
	})

	test('rejects an incorrect outer type tag', () => {
		const serialized = serializeExpression(asExpression('x'))
		expect(() => deserializeExpression({ ...serialized, type: 'Equation' } as never)).toThrow('expected type "Expression"')
	})
})
