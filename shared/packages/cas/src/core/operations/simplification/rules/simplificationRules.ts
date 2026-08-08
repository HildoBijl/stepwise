import { type SimplificationOption } from '../simplificationOptions'

import { signRules } from './signs'
import { constantRules } from './constants'
import { sumRules } from './sums'
import { productRules } from './products'
import { fractionRules } from './fractions'
import { powerRules } from './powers'
import { rootRules } from './roots'
import { logarithmRules } from './logarithms'
import { type SimplificationRule } from './utils/ruleDefinition'

export const simplificationRules = {
	...signRules,
	...constantRules,
	...sumRules,
	...productRules,
	...fractionRules,
	...powerRules,
	...rootRules,
	...logarithmRules,
} satisfies Record<SimplificationOption, SimplificationRule>

export const simplificationRuleEntries = Object.entries(simplificationRules) as [SimplificationOption, SimplificationRule][]
