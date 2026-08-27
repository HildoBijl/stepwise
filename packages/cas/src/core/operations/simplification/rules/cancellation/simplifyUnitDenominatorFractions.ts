import { isFraction } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { simplifyUnitDenominatorFractions as transform } from '../utils/defaults'

export const simplifyUnitDenominatorFractions = defineRule({
	name: 'simplifyUnitDenominatorFractions',
	appliesTo: isFraction,
	transform,
})
