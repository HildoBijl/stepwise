import { isFraction } from '../../../structural'

import { flattenProducts, flattenSums } from '../structural'
import { removeDoubleNegatives } from '../numeric'
import { cancelSumTerms } from '../cancellation'
import { defineRule } from '../ruleDefinition'
import { applyCombineFractionFactors } from '../utils'

import { combineLikeFactors } from './combineLikeFactors'

const requirements = [combineLikeFactors, cancelSumTerms, removeDoubleNegatives, flattenSums, flattenProducts] as const

export const combineFractionFactors = defineRule({
	name: 'combineFractionFactors',
	appliesTo: isFraction,
	transform: applyCombineFractionFactors,
	requires: requirements,
	after: requirements,
})
