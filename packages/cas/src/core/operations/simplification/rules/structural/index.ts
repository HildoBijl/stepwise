import { defineRuleRegistry } from '../ruleDefinition.ts'

import { flattenSums } from './flattenSums.ts'
import { flattenProducts } from './flattenProducts.ts'

export const structuralRules = defineRuleRegistry(flattenSums, flattenProducts)
export { flattenSums, flattenProducts }
