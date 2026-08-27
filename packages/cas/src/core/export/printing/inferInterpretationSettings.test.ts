import { namedConstants, product, variable } from '../../construction'

import { inferInterpretationSettingsOptions } from './inferInterpretationSettings'

describe('interpretation-setting inference', () => {
	test('enables multi-character variables when needed', () => {
		expect(inferInterpretationSettingsOptions(variable('speed'))).toMatchObject({ allowMultiCharacterVariables: true })
	})

	test('distinguishes constant and variable e', () => {
		expect(inferInterpretationSettingsOptions(namedConstants.e)).toEqual({})
		expect(inferInterpretationSettingsOptions(variable('e'))).toMatchObject({ interpretEAsConstant: false })
		expect(() => inferInterpretationSettingsOptions(product(namedConstants.e, variable('e')))).toThrow('both has a variable')
	})
})
