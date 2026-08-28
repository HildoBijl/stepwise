import { isFraction } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'
import { simplifyUnitDenominatorFractions as transform } from '../utils/defaults.ts'

export const simplifyUnitDenominatorFractions = defineRule({
	name: 'simplifyUnitDenominatorFractions',
	appliesTo: isFraction,
	transform,
})
