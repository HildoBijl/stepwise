import { defineRuleRegistry } from '../ruleDefinition'

import { expandMinusSums } from './expandMinusSums'
import { splitFractions } from './splitFractions'
import { expandPlusMinusSums } from './expandPlusMinusSums'
import { expandProductsOfSums } from './expandProductsOfSums'
import { expandPowers } from './expandPowers'
import { expandPowersOfProducts } from './expandPowersOfProducts'
import { expandPowersOfFractions } from './expandPowersOfFractions'
import { expandPowersOfSums } from './expandPowersOfSums'
import { expandRootsOfProducts } from './expandRootsOfProducts'

export const expansionRules = defineRuleRegistry(expandMinusSums, splitFractions, expandPlusMinusSums, expandProductsOfSums, expandPowers, expandPowersOfProducts, expandPowersOfFractions, expandPowersOfSums, expandRootsOfProducts)
export { expandMinusSums, splitFractions, expandPlusMinusSums, expandProductsOfSums, expandPowers, expandPowersOfProducts, expandPowersOfFractions, expandPowersOfSums, expandRootsOfProducts }
