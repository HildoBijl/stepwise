import { describe, expect, test } from 'vitest'

import { sin } from '../../../construction/index.ts'

import { areNodesEqual } from '../../structural/index.ts'

import { convertExpressionToRadians } from './degrees.ts'
import { convertExpressionSettings } from './conversion.ts'

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
