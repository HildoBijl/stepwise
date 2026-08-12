import { defineRuleRegistry } from '../ruleDefinition'

import { turnFloatsIntoIntegers } from './turnFloatsIntoIntegers'
import { mergeSumNumbers } from './mergeSumNumbers'
import { mergeProductNumbers } from './mergeProductNumbers'
import { mergeFractionNumbers } from './mergeFractionNumbers'
import { reduceNumberPowers } from './reduceNumberPowers'
import { reduceNumberRoots } from './reduceNumberRoots'
import { removeSignsFromZeros } from './removeSignsFromZeros'
import { removeDoubleNegatives } from './removeDoubleNegatives'
import { removeDoubleSigns } from './removeDoubleSigns'
import { mergeProductMinuses } from './mergeProductMinuses'
import { mergeProductPlusMinuses } from './mergeProductPlusMinuses'
import { mergeFractionMinuses } from './mergeFractionMinuses'
import { mergeFractionSumMinuses } from './mergeFractionSumMinuses'
import { mergePowerMinuses } from './mergePowerMinuses'

export const numericRules = defineRuleRegistry(turnFloatsIntoIntegers, mergeSumNumbers, mergeProductNumbers, mergeFractionNumbers, reduceNumberPowers, reduceNumberRoots, removeSignsFromZeros, removeDoubleNegatives, removeDoubleSigns, mergeProductMinuses, mergeProductPlusMinuses, mergeFractionMinuses, mergeFractionSumMinuses, mergePowerMinuses)
export { turnFloatsIntoIntegers, mergeSumNumbers, mergeProductNumbers, mergeFractionNumbers, reduceNumberPowers, reduceNumberRoots, removeSignsFromZeros, removeDoubleNegatives, removeDoubleSigns, mergeProductMinuses, mergeProductPlusMinuses, mergeFractionMinuses, mergeFractionSumMinuses, mergePowerMinuses }
export { applyRemoveDoubleNegatives } from './removeDoubleNegatives'
export { applyMergeFractionMinuses } from './mergeFractionMinuses'
export { applyMergeFractionNumbers } from './mergeFractionNumbers'
