import { arccos, arcsin, arctan, fraction, ln, log, negative, namedConstants, plusMinus, power, product, root, sin, sqrt, sum, tan, variable } from '../../construction/index.ts'
import { areNodesEqual } from '../../operations/index.ts'

import { isExpressionNodeStorageValue } from './checks.ts'
import { storageValueToNode } from './fromStorageValue.ts'
import { nodeToStorageValue } from './toStorageValue.ts'

describe('expression-node storage values', () => {
	test.each([
		2, 2.5, namedConstants.pi, negative('x'), plusMinus('x'), variable('velocity', '1', 'hat'),
		sum('x', 2), product(3, 'x'), fraction('x', 2), power('x', 3), sqrt('x'), root('x', 3),
		ln('x'), log('x', 2), sin('x'), tan('x'), arcsin('x'), arccos('x'), arctan('x'),
	])('round-trips and validates a node', input => {
		const node = typeof input === 'number' ? (input % 1 === 0 ? sum(input) : product(input)) : input
		const storageValue = nodeToStorageValue(node)
		expect(isExpressionNodeStorageValue(storageValue)).toBe(true)
		expect(areNodesEqual(storageValueToNode(storageValue), node, false)).toBe(true)
	})

	test.each([
		{ subtype: 'Unknown' },
		{ subtype: 'Integer', value: 1.5 },
		{ subtype: 'Float', value: -1 },
		{ subtype: 'NamedConstant', symbol: 'unknown' },
		{ subtype: 'Variable', symbol: '' },
		{ subtype: 'Variable', symbol: 'x', accent: 'unknown' },
		{ subtype: 'Sum', terms: [{ subtype: 'Integer', value: 1 }] },
		{ subtype: 'Product', terms: [{ subtype: 'Integer', value: 1 }, { subtype: 'Integer', value: 2 }] },
		{ subtype: 'Sqrt', argument: { subtype: 'Integer', value: 4 } },
		{ subtype: 'Root', argument: { subtype: 'Integer', value: 8 }, base: { subtype: 'Integer', value: 3 } },
		{ subtype: 'Sin', argument: { subtype: 'Integer', value: 1 }, extra: true },
	])('rejects malformed and legacy storage values', storageValue => {
		expect(isExpressionNodeStorageValue(storageValue)).toBe(false)
	})

	test('rejects sparse arrays and cyclic storage values', () => {
		const sparseTerms = new Array(2)
		sparseTerms[0] = { subtype: 'Integer', value: 1 }
		expect(isExpressionNodeStorageValue({ subtype: 'Sum', terms: sparseTerms })).toBe(false)

		const cyclic: Record<string, unknown> = { subtype: 'Minus' }
		cyclic.node = cyclic
		expect(isExpressionNodeStorageValue(cyclic)).toBe(false)
	})

	test('rejects unknown subtypes during reconstruction', () => {
		expect(() => storageValueToNode({ subtype: 'Unknown' } as never)).toThrow('no known deserialization method')
	})
})