// Parsing and rendering helpers for the tagged translation syntax.
const tagRegEx = /\{([a-zA-Z0-9-]+)\}|<([a-zA-Z0-9-]+)>|<\/([a-zA-Z0-9-]+)>|<([a-zA-Z0-9-]+)\/>/g

export function parseTagTree(tagTreeString) {
	const stack = []
	const mainList = []
	let currentList = mainList
	let lastIndex = 0

	for (const match of tagTreeString.matchAll(tagRegEx)) {
		const index = match.index
		if (index > lastIndex) currentList.push({ type: 'text', value: tagTreeString.substring(lastIndex, index) })

		if (match[1] !== undefined) {
			currentList.push({ type: 'variable', name: match[1] })
		} else if (match[2] !== undefined) {
			const node = { type: 'tag', name: match[2], value: [] }
			currentList.push(node)
			stack.push(node)
			currentList = node.value
		} else if (match[3] !== undefined) {
			const tag = stack.pop()
			if (!tag) throw new Error(`Invalid tag string: closing tag </${match[3]}> without open. Full string:\n${tagTreeString}`)
			if (tag.name !== match[3]) throw new Error(`Invalid tag string: opened <${tag.name}> but closed </${match[3]}>. Full string:\n${tagTreeString}`)
			currentList = stack.length > 0 ? stack[stack.length - 1].value : mainList
		} else if (match[4] !== undefined) {
			currentList.push({ type: 'tag', name: match[4] })
		} else {
			throw new Error(`Invalid tag string while parsing. Full string:\n${tagTreeString}`)
		}

		lastIndex = index + match[0].length
	}

	if (lastIndex < tagTreeString.length) currentList.push({ type: 'text', value: tagTreeString.substring(lastIndex) })
	if (stack.length > 0) {
		const open = stack[stack.length - 1]
		throw new Error(`Invalid tag string: opened tag <${open.name}> was never closed. Full string:\n${tagTreeString}`)
	}
	return mainList
}

export function renderTagTree(tree) {
	const items = Array.isArray(tree) ? tree : [tree]
	return items.map(item => {
		if (item.type === 'text') return item.value
		if (item.type === 'variable') return `{${item.name}}`
		if (item.type === 'tag') return item.value ? `<${item.name}>${renderTagTree(item.value)}</${item.name}>` : `<${item.name}/>`
		throw new Error('Invalid tag tree element encountered while rendering.')
	}).join('')
}
