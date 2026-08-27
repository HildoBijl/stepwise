import { arccos, arcsin, arctan, fraction, ln, log, negative, namedConstants, plusMinus, power, product, root, sin, sqrt, sum, tan, variable } from '../../construction'
import { areNodesEqual } from '../../operations'

import { storageValueToNode } from './fromStorageValue'
import { nodeToStorageValue } from './toStorageValue'

describe('expression-node storage values', () => {
	test.each([
		2, 2.5, namedConstants.pi, negative('x'), plusMinus('x'), variable('velocity', '1', 'hat'),
		sum('x', 2), product(3, 'x'), fraction('x', 2), power('x', 3), sqrt('x'), root('x', 3),
		ln('x'), log('x', 2), sin('x'), tan('x'), arcsin('x'), arccos('x'), arctan('x'),
	])('round-trips a node', input => {
		const node = typeof input === 'number' ? (input % 1 === 0 ? sum(input) : product(input)) : input
		const restored = storageValueToNode(nodeToStorageValue(node))
		expect(areNodesEqual(restored, node, false)).toBe(true)
	})

	test('reads legacy product and root field names', () => {
		expect(storageValueToNode({ subtype: 'Product', terms: [{ subtype: 'Integer', value: 2 }, { subtype: 'Variable', symbol: 'x' }] } as never).subtype).toBe('Product')
		expect(storageValueToNode({ subtype: 'Sqrt', argument: { subtype: 'Integer', value: 4 } } as never).subtype).toBe('Sqrt')
	})

	test('rejects unknown subtypes', () => {
		expect(() => storageValueToNode({ subtype: 'Unknown' } as never)).toThrow('no known deserialization method')
	})
})
