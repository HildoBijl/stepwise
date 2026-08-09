import { defineRuleRegistry } from '../ruleDefinition'

import { flattenSums } from './flattenSums'
import { flattenProducts } from './flattenProducts'

export const structuralRules = defineRuleRegistry(flattenSums, flattenProducts)
export { flattenSums, flattenProducts }
