import { isValidLocale } from '../locale.ts'

import { type Message, type MessageNode, type PluralCategory } from './types.ts'
import { type MessageValidationIssue } from './validation.ts'

// Validate the message rules that depend on a specific locale.
export function validateMessageForLocale(message: Message, locale: string): MessageValidationIssue[] {
	// Validate the locale and get its cardinal rules.
	if (!isValidLocale(locale)) return [{ path: '$', message: `Invalid locale "${locale}".` }]
	const cardinalRules = new Intl.PluralRules(locale)

	// Iterate over the nodes in the message to validate them.
	const issues: MessageValidationIssue[] = []
	validateNodes(message, locale, cardinalRules, '$', issues)
	return issues
}

// Check if all the plurals in a given message are valid, and push an issue otherwise.
function validateNodes(message: Message, locale: string, cardinalRules: Intl.PluralRules, path: string, issues: MessageValidationIssue[]): void {
	message.forEach((node, index) => validateNode(node, locale, cardinalRules, `${path}[${index}]`, issues))
}

// Check if all the plurals in a given node are valid, and push an issue otherwise.
function validateNode(node: MessageNode, locale: string, cardinalRules: Intl.PluralRules, path: string, issues: MessageValidationIssue[]): void {
	// For components, iterate over the slots to find potential plurals.
	if (node.type === 'component') {
		Object.entries(node.slots).forEach(([name, message]) => validateNodes(message, locale, cardinalRules, `${path}.slots.${name}`, issues))
		return
	}

	// For selects, iterate over the branches to find potential plurals.
	if (node.type === 'select') {
		Object.entries(node.branches).forEach(([value, message]) => validateNodes(message, locale, cardinalRules, `${path}.branches.${value}`, issues))
		return
	}

	// For text/variable, there can be no plural.
	if (node.type !== 'plural') return

	// For plurals, extract the current locale's plural categories and check if there is any that falls outside of them. Also iterate over branches and exact branches.
	const rules = node.form === 'ordinal' ? new Intl.PluralRules(locale, { type: 'ordinal' }) : cardinalRules
	const categories = new Set(rules.resolvedOptions().pluralCategories)
	Object.entries(node.branches).forEach(([category, branch]) => {
		if (!categories.has(category as PluralCategory))
			issues.push({ path: `${path}.branches.${category}`, message: `Plural category "${category}" is not used by locale "${locale}".` })
		validateNodes(branch, locale, cardinalRules, `${path}.branches.${category}`, issues)
	})
	Object.entries(node.exactBranches ?? {}).forEach(([value, branch]) => validateNodes(branch, locale, cardinalRules, `${path}.exactBranches.${value}`, issues))
}
