import { type ComponentNode, type Message, type MessageNode, type PluralNode, type SelectNode, pluralCategories } from './types.ts'

/*
 * Error types.
 */

export type MessageValidationIssue = {
	path: string
	message: string
}

// Custom error type for invalid messages.
export class InvalidMessageError extends Error {
	readonly issues: readonly MessageValidationIssue[]

	constructor(issues: readonly MessageValidationIssue[]) {
		super(`Invalid translation message:\n${issues.map(issue => `${issue.path}: ${issue.message}`).join('\n')}`)
		this.name = 'InvalidMessageError'
		this.issues = issues
	}
}

/*
 * Public functions for message validation. Note: this only checks the structure, it does not do locale-dependent validation.
 */

// Assume that the message is a valid message: no issues.
export function assertValidMessage(message: Message): void {
	const issues = validateMessage(message)
	if (issues.length > 0) throw new InvalidMessageError(issues)
}

// Validate semantic rules that are independent of React components and target locales.
export function validateMessage(message: Message): MessageValidationIssue[] {
	const issues: MessageValidationIssue[] = []
	const componentIds = new Set<string>()
	validateNodes(message, '$', componentIds, issues)
	return issues
}

/*
 * General internal functions.
 */

// Validate all the nodes within the given message.
function validateNodes(message: Message, path: string, componentIds: Set<string>, issues: MessageValidationIssue[]): void {
	message.forEach((node, index) => validateNode(node, `${path}[${index}]`, componentIds, issues))
}

// Validate a single node. Use recursion to evaluate contents.
function validateNode(node: MessageNode, path: string, componentIds: Set<string>, issues: MessageValidationIssue[]): void {
	switch (node.type) {
		case 'text':
			return

		case 'variable':
			validateVariableName(node.name, `${path}.name`, issues)
			return

		case 'component':
			validateComponent(node, path, componentIds, issues)
			return

		case 'plural':
			validatePlural(node, path, componentIds, issues)
			return

		case 'select':
			validateSelect(node, path, componentIds, issues)
			return
	}
}

/*
 * Validation functions per type.
 */

function validateVariableName(name: string, path: string, issues: MessageValidationIssue[]): void {
	if (!isValidName(name)) addIssue(issues, path, 'Variable names must be non-empty identifiers.')
}

function validateComponent(node: ComponentNode, path: string, componentIds: Set<string>, issues: MessageValidationIssue[]): void {
	// Check the node ID.
	if (!isValidXmlId(node.id)) addIssue(issues, `${path}.id`, 'Component IDs must be valid XLIFF NMTOKEN-compatible values.')
	else if (componentIds.has(node.id)) addIssue(issues, `${path}.id`, `Duplicate component ID "${node.id}".`)
	else componentIds.add(node.id)

	// Check the node component.
	if (!isValidName(node.component)) addIssue(issues, `${path}.component`, 'Component names must be non-empty identifiers.')
	if (node.copyOf === node.id) addIssue(issues, `${path}.copyOf`, 'A component cannot copy itself.')
	if (node.copyOf !== undefined && !isValidXmlId(node.copyOf)) addIssue(issues, `${path}.copyOf`, 'Copied component IDs must be valid XLIFF NMTOKEN-compatible values.')

	// Check the slots.
	Object.entries(node.slots).forEach(([name, slot]) => {
		if (!isValidName(name)) addIssue(issues, `${path}.slots.${name}`, 'Slot names must be non-empty identifiers.')
		validateNodes(slot, `${path}.slots.${name}`, componentIds, issues)
	})
}

function validatePlural(node: PluralNode, path: string, componentIds: Set<string>, issues: MessageValidationIssue[]): void {
	// Check the variable.
	validateVariableName(node.variable, `${path}.variable`, issues)

	// Check the branches.
	if (!node.branches.other) addIssue(issues, `${path}.branches.other`, 'Plural messages must define an other branch.')
	Object.entries(node.branches).forEach(([category, branch]) => {
		if (!pluralCategories.includes(category as typeof pluralCategories[number])) addIssue(issues, `${path}.branches.${category}`, `Unknown plural category "${category}".`)
		validateNodes(branch, `${path}.branches.${category}`, componentIds, issues)
	})

	// Check the exact branches.
	Object.entries(node.exactBranches ?? {}).forEach(([value, branch]) => {
		if (!isCanonicalNumber(value)) addIssue(issues, `${path}.exactBranches.${value}`, 'Exact plural keys must be canonical finite numbers.')
		validateNodes(branch, `${path}.exactBranches.${value}`, componentIds, issues)
	})
}

function validateSelect(node: SelectNode, path: string, componentIds: Set<string>, issues: MessageValidationIssue[]): void {
	// Check the variable.
	validateVariableName(node.variable, `${path}.variable`, issues)

	// Check the branches.
	if (!node.branches.other) addIssue(issues, `${path}.branches.other`, 'Select messages must define an other branch.')
	Object.entries(node.branches).forEach(([value, branch]) => {
		if (value.length === 0) addIssue(issues, `${path}.branches`, 'Select branch names must not be empty.')
		validateNodes(branch, `${path}.branches.${value}`, componentIds, issues)
	})
}

/*
 * Support functions.
 */

function isValidName(value: string): boolean {
	return /^[A-Za-z_$][A-Za-z0-9_$.-]*$/.test(value)
}

function isValidXmlId(value: string): boolean {
	return /^[A-Za-z0-9_.:-]+$/.test(value)
}

function isCanonicalNumber(value: string): boolean {
	const number = Number(value)
	return Number.isFinite(number) && String(number) === value
}

function addIssue(issues: MessageValidationIssue[], path: string, message: string): void {
	issues.push({ path, message })
}
