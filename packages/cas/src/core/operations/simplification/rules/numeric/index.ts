import { defineRuleRegistry } from '../ruleDefinition.ts'

import { convertIntegerFloatsToIntegers } from './convertIntegerFloatsToIntegers.ts'
import { combineNumbersInSums } from './combineNumbersInSums.ts'
import { combineNumbersInProducts } from './combineNumbersInProducts.ts'
import { combineNumbersInFractions } from './combineNumbersInFractions.ts'
import { evaluateNumericPowers } from './evaluateNumericPowers.ts'
import { evaluateNumericRoots } from './evaluateNumericRoots.ts'
import { removeSignsFromZero } from './removeSignsFromZero.ts'
import { removeDoubleNegatives } from './removeDoubleNegatives.ts'
import { removeDoubleSigns } from './removeDoubleSigns.ts'
import { combineMinusSignsInProducts } from './combineMinusSignsInProducts.ts'
import { combinePlusMinusSignsInProducts } from './combinePlusMinusSignsInProducts.ts'
import { combineMinusSignsInFractions } from './combineMinusSignsInFractions.ts'
import { factorMinusSignsOutOfFractionSums } from './factorMinusSignsOutOfFractionSums.ts'
import { combineMinusSignsInPowers } from './combineMinusSignsInPowers.ts'

export const numericRules = defineRuleRegistry(convertIntegerFloatsToIntegers, combineNumbersInSums, combineNumbersInProducts, combineNumbersInFractions, evaluateNumericPowers, evaluateNumericRoots, removeSignsFromZero, removeDoubleNegatives, removeDoubleSigns, combineMinusSignsInProducts, combinePlusMinusSignsInProducts, combineMinusSignsInFractions, factorMinusSignsOutOfFractionSums, combineMinusSignsInPowers)
export { convertIntegerFloatsToIntegers, combineNumbersInSums, combineNumbersInProducts, combineNumbersInFractions, evaluateNumericPowers, evaluateNumericRoots, removeSignsFromZero, removeDoubleNegatives, removeDoubleSigns, combineMinusSignsInProducts, combinePlusMinusSignsInProducts, combineMinusSignsInFractions, factorMinusSignsOutOfFractionSums, combineMinusSignsInPowers }
export { applyRemoveDoubleNegatives } from './removeDoubleNegatives.ts'
export { applyCombineMinusSignsInFractions } from './combineMinusSignsInFractions.ts'
export { applyCombineNumbersInFractions } from './combineNumbersInFractions.ts'
