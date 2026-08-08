import { isFraction } from '../../../structural'

import { defineRule } from '../utils'
import { reduceFractionsWithOneDenominator as transform } from '../utils/defaults'

export const reduceFractionsWithOneDenominator = defineRule({
	appliesTo: isFraction,
	transform,
})
