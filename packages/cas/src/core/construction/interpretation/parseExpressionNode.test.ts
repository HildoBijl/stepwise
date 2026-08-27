import { product, variable } from '../creation'
import { areNodesEqual } from '../../operations'

import { parseExpressionNode } from './parseExpressionNode'

describe('parseExpressionNode', () => {
	test('uses the numeric token grammar consistently', () => {
		expect(parseExpressionNode('12.5').subtype).toBe('Float')
		expect(() => parseExpressionNode('1.2.3')).toThrow()
	})

	test('applies variable interpretation settings', () => {
		expect(areNodesEqual(parseExpressionNode('xy'), product('x', 'y'), false)).toBe(true)
		expect(areNodesEqual(parseExpressionNode('xy', { allowMultiCharacterVariables: true }), variable('xy'), false)).toBe(true)
	})

	test('rejects unmatched brackets', () => {
		expect(() => parseExpressionNode('(x+1')).toThrow()
		expect(() => parseExpressionNode('(x+1]')).toThrow()
	})
})
