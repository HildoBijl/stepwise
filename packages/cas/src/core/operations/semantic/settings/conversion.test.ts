import { sin } from '../../../construction'
import { areNodesEqual } from '../../structural'

import { convertExpressionToRadians } from './degrees'
import { convertExpressionSettings } from './conversion'

describe('expression-setting conversion', () => {
	test('returns the original node when angle units agree', () => {
		const node = sin('x')
		expect(convertExpressionSettings(node, { angleUnit: 'degrees' }, { angleUnit: 'degrees' })).toBe(node)
	})

	test('converts when angle units differ', () => {
		const node = sin('x')
		expect(areNodesEqual(convertExpressionSettings(node, { angleUnit: 'degrees' }, { angleUnit: 'radians' }), convertExpressionToRadians(node), false)).toBe(true)
	})
})
