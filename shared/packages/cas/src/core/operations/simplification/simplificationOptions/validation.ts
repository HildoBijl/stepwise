import { simplificationRules } from '../rules'

import { type SimplificationOptions } from './types'
import { ensureSimplificationOptionSet, isSimplificationOption } from './utils'

export function validateSimplificationOptions(options: SimplificationOptions): SimplificationOptions {
	ensureSimplificationOptionSet(options)
	const errors: string[] = []
	for (const option of options) {
		const rule = simplificationRules[option]
		for (const requirement of rule.requires ?? []) {
			if (!isSimplificationOption(requirement.name) || !options.has(requirement.name)) errors.push(`Invalid simplification options: "${rule.name}" requires "${requirement.name}".`)
		}
		for (const conflict of rule.conflictsWith ?? []) {
			if (isSimplificationOption(conflict.name) && options.has(conflict.name)) errors.push(`Invalid simplification options: "${rule.name}" conflicts with "${conflict.name}".`)
		}
	}
	if (errors.length > 0) throw new Error(errors.join('\n'))
	return options
}
