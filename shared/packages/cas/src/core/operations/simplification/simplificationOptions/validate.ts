import { simplificationRuleEntries } from '../rules'

import { type SimplificationOptions } from './types'
import { ensureSimplificationOptionSet } from './utils'

export function validateSimplificationOptions(options: SimplificationOptions): SimplificationOptions {
	ensureSimplificationOptionSet(options)

	const errors: string[] = []
	for (const [option, rule] of simplificationRuleEntries) {
		if (!options.has(option)) continue
		for (const requirement of rule.requires ?? []) {
			if (!options.has(requirement)) errors.push(`Invalid simplification options: "${option}" requires "${requirement}".`)
		}
		for (const conflict of rule.conflictsWith ?? []) {
			if (options.has(conflict)) errors.push(`Invalid simplification options: "${option}" conflicts with "${conflict}".`)
		}
	}

	if (errors.length > 0) throw new Error(errors.join('\n'))
	return options
}
