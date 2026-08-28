import { isFraction } from '../../../structural/index.ts'

import { flattenProducts, flattenSums } from '../structural/index.ts'
import { removeDoubleNegatives } from '../numeric/index.ts'
import { cancelSumTerms } from '../cancellation/index.ts'
import { defineRule } from '../ruleDefinition.ts'
import { applyCombineFractionFactors } from '../utils/index.ts'

import { combineLikeFactors } from './combineLikeFactors.ts'

const requirements = [combineLikeFactors, cancelSumTerms, removeDoubleNegatives, flattenSums, flattenProducts] as const

export const combineFractionFactors = defineRule({
	name: 'combineFractionFactors',
	appliesTo: isFraction,
	transform: applyCombineFractionFactors,
	requires: requirements,
	after: requirements,
})
