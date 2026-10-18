import { type ComponentNode, type Message, type MessageNode, type PluralNode, type SelectNode, pluralCategories } from './types.ts'

// Return a canonical message without empty or adjacent text nodes and with stable map ordering.
export function normalizeMessage(message: Message): Message {
	const result: MessageNode[] = []
	message.forEach(node => {
		const normalizedNode = normalizeNode(node)
		if (normalizedNode.type === 'text' && normalizedNode.value.length === 0) return
		const previousNode = result.at(-1)
		if (previousNode?.type === 'text' && normalizedNode.type === 'text') {
			result[result.length - 1] = { type: 'text', value: previousNode.value + normalizedNode.value }
			return
		}
		result.push(normalizedNode)
	})
	return result
}

// Normalize the node based on its type. Text and variable are always already normalized.
function normalizeNode(node: MessageNode): MessageNode {
	switch (node.type) {
		case 'text': return { ...node }
		case 'variable': return { ...node }
		case 'component': return normalizeComponent(node)
		case 'plural': return normalizePlural(node)
		case 'select': return normalizeSelect(node)
	}
}

// For a component, sort the slots by their keys and normalize their contents.
function normalizeComponent(node: ComponentNode): ComponentNode {
	return {
		...node,
		slots: Object.fromEntries(Object.entries(node.slots)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([name, message]) => [name, normalizeMessage(message)])),
	}
}

// For a plural, order the branches by their default order (and normalize contents), sort exact branches by their keys (and normalize contents) and default form to cardinal.
function normalizePlural(node: PluralNode): PluralNode {
	const branches = Object.fromEntries(pluralCategories
		.filter(category => node.branches[category] !== undefined)
		.map(category => [category, normalizeMessage(node.branches[category]!)])) as PluralNode['branches']
	const exactBranches = node.exactBranches && Object.fromEntries(Object.entries(node.exactBranches)
		.sort(([left], [right]) => Number(left) - Number(right) || left.localeCompare(right))
		.map(([value, message]) => [value, normalizeMessage(message)]))

	return {
		...node,
		branches,
		...(exactBranches && { exactBranches }),
		form: node.form ?? 'cardinal',
	}
}

// For a select, sort the branches by their key and normalize contents.
function normalizeSelect(node: SelectNode): SelectNode {
	return {
		...node,
		branches: Object.fromEntries(Object.entries(node.branches)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([value, message]) => [value, normalizeMessage(message)])) as SelectNode['branches'],
	}
}
