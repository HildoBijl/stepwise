import { asEquation } from './Equation.ts'
import { deserializeEquation, serializeEquation } from './serialization.ts'

describe('equation serialization', () => {
	test('round-trips storage and wrapper settings', () => {
		const equation = asEquation('sin(x)=1', undefined, { angleUnit: 'degrees' })
		const restored = deserializeEquation(serializeEquation(equation))
		expect(restored.strictEqualStructure(equation)).toBe(true)
		expect(restored.settings).toEqual(equation.settings)
	})

	test('omits default settings and retains non-default settings', () => {
		expect(serializeEquation(asEquation('x=1'))).not.toHaveProperty('settings')
		expect(serializeEquation(asEquation('sin(x)=1', undefined, { angleUnit: 'degrees' })).settings).toEqual({ angleUnit: 'degrees' })
	})

	test('rejects an incorrect outer type tag', () => {
		const serialized = serializeEquation(asEquation('x=1'))
		expect(() => deserializeEquation({ ...serialized, type: 'Expression' } as never)).toThrow('expected type "Equation"')
	})
})
