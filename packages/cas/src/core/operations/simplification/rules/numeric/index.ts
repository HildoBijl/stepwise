import { defineRuleRegistry } from '../ruleDefinition'

import { convertIntegerFloatsToIntegers } from './convertIntegerFloatsToIntegers'
import { combineNumbersInSums } from './combineNumbersInSums'
import { combineNumbersInProducts } from './combineNumbersInProducts'
import { combineNumbersInFractions } from './combineNumbersInFractions'
import { evaluateNumericPowers } from './evaluateNumericPowers'
import { evaluateNumericRoots } from './evaluateNumericRoots'
import { removeSignsFromZero } from './removeSignsFromZero'
import { removeDoubleNegatives } from './removeDoubleNegatives'
import { removeDoubleSigns } from './removeDoubleSigns'
import { combineMinusSignsInProducts } from './combineMinusSignsInProducts'
import { combinePlusMinusSignsInProducts } from './combinePlusMinusSignsInProducts'
import { combineMinusSignsInFractions } from './combineMinusSignsInFractions'
import { factorMinusSignsOutOfFractionSums } from './factorMinusSignsOutOfFractionSums'
import { combineMinusSignsInPowers } from './combineMinusSignsInPowers'

export const numericRules = defineRuleRegistry(convertIntegerFloatsToIntegers, combineNumbersInSums, combineNumbersInProducts, combineNumbersInFractions, evaluateNumericPowers, evaluateNumericRoots, removeSignsFromZero, removeDoubleNegatives, removeDoubleSigns, combineMinusSignsInProducts, combinePlusMinusSignsInProducts, combineMinusSignsInFractions, factorMinusSignsOutOfFractionSums, combineMinusSignsInPowers)
export { convertIntegerFloatsToIntegers, combineNumbersInSums, combineNumbersInProducts, combineNumbersInFractions, evaluateNumericPowers, evaluateNumericRoots, removeSignsFromZero, removeDoubleNegatives, removeDoubleSigns, combineMinusSignsInProducts, combinePlusMinusSignsInProducts, combineMinusSignsInFractions, factorMinusSignsOutOfFractionSums, combineMinusSignsInPowers }
export { applyRemoveDoubleNegatives } from './removeDoubleNegatives'
export { applyCombineMinusSignsInFractions } from './combineMinusSignsInFractions'
export { applyCombineNumbersInFractions } from './combineNumbersInFractions'
