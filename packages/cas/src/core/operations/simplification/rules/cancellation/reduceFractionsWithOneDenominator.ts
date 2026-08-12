import { isFraction } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { reduceFractionsWithOneDenominator as transform } from '../utils/defaults'

export const reduceFractionsWithOneDenominator = defineRule({
	name: 'reduceFractionsWithOneDenominator',
	appliesTo: isFraction,
	transform,
})
