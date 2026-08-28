import { defineRuleRegistry } from '../ruleDefinition.ts'

import { expandMinusSums } from './expandMinusSums.ts'
import { splitFractions } from './splitFractions.ts'
import { expandPlusMinusSums } from './expandPlusMinusSums.ts'
import { expandProductsOfSums } from './expandProductsOfSums.ts'
import { expandPowers } from './expandPowers.ts'
import { expandPowersOfProducts } from './expandPowersOfProducts.ts'
import { expandPowersOfFractions } from './expandPowersOfFractions.ts'
import { expandPowersOfSums } from './expandPowersOfSums.ts'
import { expandRootsOfProducts } from './expandRootsOfProducts.ts'

export const expansionRules = defineRuleRegistry(expandMinusSums, splitFractions, expandPlusMinusSums, expandProductsOfSums, expandPowers, expandPowersOfProducts, expandPowersOfFractions, expandPowersOfSums, expandRootsOfProducts)
export { expandMinusSums, splitFractions, expandPlusMinusSums, expandProductsOfSums, expandPowers, expandPowersOfProducts, expandPowersOfFractions, expandPowersOfSums, expandRootsOfProducts }
