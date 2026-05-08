import { defaultInterpretationSettings } from '@step-wise/math-input-value'

import { stringToExpressionNode } from '../construction'
import { equalNodes } from '../operations'

import { parserTestCases } from './testCases'

describe('stringToExpressionNode', () => {
	test.each(parserTestCases)('interprets "$str"', ({ str, node }) => {
		expect(equalNodes(stringToExpressionNode(str, defaultInterpretationSettings), node)).toBe(true)
	})
})
