import { describe, expect, it } from 'vitest'

import { defaultExpressionSettings, isExpressionSettingsOptions, resolveExpressionSettings } from './expressionSettings'

describe('expression settings', () => {
	it('defines and resolves the defaults', () => {
		expect(defaultExpressionSettings).toEqual({ angleUnit: 'radians' })
		expect(resolveExpressionSettings()).toEqual(defaultExpressionSettings)
		expect(resolveExpressionSettings({ angleUnit: 'degrees' })).toEqual({ angleUnit: 'degrees' })
	})

	it.each([{}, { angleUnit: 'radians' }, { angleUnit: 'degrees' }])('accepts valid options %#', value => {
		expect(isExpressionSettingsOptions(value)).toBe(true)
	})

	it.each([null, [], 'degrees', { angleUnit: 'gradians' }, { angleUnit: 1 }])('rejects invalid options %#', value => {
		expect(isExpressionSettingsOptions(value)).toBe(false)
	})
})
