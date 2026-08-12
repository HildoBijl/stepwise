import { isFraction } from '../../../structural'

import { flattenProducts, flattenSums } from '../structural'
import { removeDoubleNegatives } from '../numeric'
import { cancelSumTerms } from '../cancellation'
import { defineRule } from '../ruleDefinition'
import { applyMergeFractionFactors } from '../utils'

import { mergeProductFactors } from './mergeProductFactors'

const requirements = [mergeProductFactors, cancelSumTerms, removeDoubleNegatives, flattenSums, flattenProducts] as const

export const mergeFractionFactors = defineRule({
	name: 'mergeFractionFactors',
	appliesTo: isFraction,
	transform: applyMergeFractionFactors,
	requires: requirements,
	after: requirements,
})
