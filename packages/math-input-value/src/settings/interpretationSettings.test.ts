import { describe, expect, it } from 'vitest'

import { defaultInterpretationSettings, isInterpretationSettingsOptions, resolveInterpretationSettings } from './interpretationSettings'

describe('interpretation settings', () => {
	it('defines and resolves all defaults', () => {
		expect(defaultInterpretationSettings).toEqual({
			interpretEAsConstant: true,
			recognizeLogarithms: true,
			recognizeTrigonometricFunctions: true,
			allowMultiCharacterVariables: false,
		})
		expect(resolveInterpretationSettings()).toEqual(defaultInterpretationSettings)
	})

	it('merges partial overrides without mutating them or the defaults', () => {
		const options = { recognizeLogarithms: false }
		expect(resolveInterpretationSettings(options)).toEqual({ ...defaultInterpretationSettings, recognizeLogarithms: false })
		expect(options).toEqual({ recognizeLogarithms: false })
		expect(defaultInterpretationSettings.recognizeLogarithms).toBe(true)
	})

	it.each(Object.keys(defaultInterpretationSettings))('accepts a boolean value for %s', key => {
		expect(isInterpretationSettingsOptions({ [key]: false })).toBe(true)
		expect(isInterpretationSettingsOptions({ [key]: true })).toBe(true)
	})

	it.each([null, [], true, { recognizeLogarithms: 'yes' }])('rejects invalid options %#', value => {
		expect(isInterpretationSettingsOptions(value)).toBe(false)
	})

	it('currently ignores unknown keys during validation', () => {
		expect(isInterpretationSettingsOptions({ futureSetting: 'anything' })).toBe(true)
	})
})
