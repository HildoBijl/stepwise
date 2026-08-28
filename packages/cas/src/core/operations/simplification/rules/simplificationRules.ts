import { mergeRuleRegistries } from './ruleDefinition.ts'
import { structuralRules } from './structural/index.ts'
import { numericRules } from './numeric/index.ts'
import { cancellationRules } from './cancellation/index.ts'
import { rewritingRules } from './rewriting/index.ts'
import { combinationRules } from './combination/index.ts'
import { expansionRules } from './expansion/index.ts'
import { factorizationRules } from './factorization/index.ts'
import { normalizationRules } from './normalization/index.ts'

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
