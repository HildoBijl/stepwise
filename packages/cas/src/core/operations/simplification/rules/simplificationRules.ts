import { mergeRuleRegistries } from './ruleDefinition'
import { structuralRules } from './structural'
import { numericRules } from './numeric'
import { cancellationRules } from './cancellation'
import { rewritingRules } from './rewriting'
import { combinationRules } from './combination'
import { expansionRules } from './expansion'
import { factorizationRules } from './factorization'
import { normalizationRules } from './normalization'

export const simplificationRules = mergeRuleRegistries(
	structuralRules,
	numericRules,
	cancellationRules,
	rewritingRules,
	combinationRules,
	expansionRules,
	factorizationRules,
	normalizationRules,
)
