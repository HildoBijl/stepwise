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
	switch (node.type) {
		// Text and variables contain no nested messages requiring locale validation.
		case 'text':
		case 'variable':
			return

		// For components, iterate over the slots to validate their contents.
		case 'component':
			Object.entries(node.slots).forEach(([name, message]) => validateNodes(message, locale, cardinalRules, `${path}.slots.${name}`, issues))
			return

		// For selects, iterate over the branches.
		case 'select':
			Object.entries(node.branches).forEach(([value, message]) => validateNodes(message, locale, cardinalRules, `${path}.branches.${value}`, issues))
			return

		// For conditions, iterate over the two options.
		case 'condition':
			validateNodes(node.true, locale, cardinalRules, `${path}.true`, issues)
			validateNodes(node.false, locale, cardinalRules, `${path}.false`, issues)
			return

		// For plurals, check their categories against the locale and recursively validate every branch.
		case 'plural': {
			const rules = node.form === 'ordinal' ? new Intl.PluralRules(locale, { type: 'ordinal' }) : cardinalRules
			const categories = new Set(rules.resolvedOptions().pluralCategories)
			Object.entries(node.branches).forEach(([category, branch]) => {
				if (!categories.has(category as PluralCategory))
					issues.push({ path: `${path}.branches.${category}`, message: `Plural category "${category}" is not used by locale "${locale}".` })
				validateNodes(branch, locale, cardinalRules, `${path}.branches.${category}`, issues)
			})
			Object.entries(node.exactBranches ?? {}).forEach(([value, branch]) => validateNodes(branch, locale, cardinalRules, `${path}.exactBranches.${value}`, issues))
			return
		}
	}
}
