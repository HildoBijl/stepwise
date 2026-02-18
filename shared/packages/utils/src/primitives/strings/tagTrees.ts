// Parsing and rendering helpers for a tiny tagged-template syntax.

export type TextNode = { type: 'text'; value: string }
export type VariableNode = { type: 'variable'; name: string }
export type TagNode = { type: 'tag'; name: string; value?: TagTree }
export type TagTreeItem = TextNode | VariableNode | TagNode
export type TagTree = TagTreeItem[]

// Regex for variable `{name}`, open-tag `<name>`, close-tag `</name>` or self-closing `<name/>`.
const tagRegEx = /\{([a-zA-Z0-9-]+)\}|<([a-zA-Z0-9-]+)>|<\/([a-zA-Z0-9-]+)>|<([a-zA-Z0-9-]+)\/>/

// Parse a string into a TagTree (array of nodes). Example input: "Hello <strong>{name}</strong> world" -> [{type:'text', value:'Hello '}, {type:'tag', name:'strong', value:[{type:'variable', name:'name'}]}, {type:'text', value:' world'}]
export function parseTagTree(tagTreeString: string): TagTree {
	// Define storage parameters.
	const stack: TagNode[] = [] // Stack of open tags.
	const mainList: TagTree = [] // The tag-tree list (which may have lists inside of it).
	let currentList: TagTree = mainList // A pointer to the current list.

	// Use matchAll to iterate matches and their indices.
	let lastIndex = 0
	for (const match of tagTreeString.matchAll(tagRegEx)) {
		const idx = match.index as number

		// Add preceding text if any.
		if (idx > lastIndex) currentList.push({ type: 'text', value: tagTreeString.substring(lastIndex, idx) })

		// Determine which capture group matched. match[1] => variable, match[2] => open tag, match[3] => close tag, match[4] => self-closing.
		if (match[1] !== undefined) {
			currentList.push({ type: 'variable', name: match[1] })
		} else if (match[2] !== undefined) {
			const node: TagNode = { type: 'tag', name: match[2], value: [] }
			currentList.push(node)
			stack.push(node)
			currentList = node.value as TagTree // Dive down.
		} else if (match[3] !== undefined) {
			const tag = stack.pop() // Pop back up.
			if (!tag) throw new Error(`Invalid tag string: closing tag </${match[3]}> without open. Full string:\n${tagTreeString}`)
			if (tag.name !== match[3]) throw new Error(`Invalid tag string: opened <${tag.name}> but closed </${match[3]}>. Full string:\n${tagTreeString}`)
			currentList = stack.length > 0 ? (stack[stack.length - 1].value as TagTree) : mainList
		} else if (match[4] !== undefined) {
			currentList.push({ type: 'tag', name: match[4] })
		} else {
			throw new Error(`Invalid tag string while parsing. Full string:\n${tagTreeString}`) // Should never happen.
		}

		// Advance lastIndex past the matched token.
		lastIndex = idx + match[0].length
	}

	// Append trailing text if any.
	if (lastIndex < tagTreeString.length) mainList.push({ type: 'text', value: tagTreeString.substring(lastIndex) })

	// Ensure no unclosed tags remain.
	if (stack.length > 0) {
		const open = stack[stack.length - 1]
		throw new Error(`Invalid tag string: opened tag <${open.name}> was never closed. Full string:\n${tagTreeString}`)
	}

	// Return the full tag tree.
	return mainList
}

// Render a TagTree back into a string. Accepts either a tree or a single node for convenience.
export function renderTagTree(tree: TagTree): string {
  return tree.map(item => {
    if (item.type === 'text') return item.value
    if (item.type === 'variable') return `{${item.name}}`
    if (item.type === 'tag') {
      if (!item.value) return `<${item.name}/>`
      return `<${item.name}>${renderTagTree(item.value)}</${item.name}>`
    }
    throw new Error('Invalid tag tree element encountered while rendering.')
  }).join('')
}
