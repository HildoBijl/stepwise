import { type SaxesAttributeNS, type SaxesTagNS, SaxesParser } from 'saxes'

import { type Catalog, type CatalogEntry, type CatalogGroup, type CatalogUnit } from '../catalog/types.ts'
import { validateCatalog } from '../catalog/validation.ts'
import { type Message, type MessageNode, pluralCategories } from '../message/types.ts'
import { componentSubTypePrefix, stepWiseNamespace, variableSubType, xliffNamespace } from './constants.ts'
import { InvalidXliffError } from './errors.ts'

type XmlNode = string | XmlElement

type XmlElement = {
	localName: string
	namespace: string
	attributes: readonly XmlAttribute[]
	children: XmlNode[]
}

type XmlAttribute = {
	localName: string
	namespace: string
	value: string
}

/*
 * Public functions.
 */

// Parse and validate a Step-Wise XLIFF 2.1 catalog.
export function parseXliff(xml: string): Catalog {
	// Parse the XML into a node tree.
	const root = parseXml(xml)

	// Make sure the outer containers are what we expect from a XLIFF 2.1 file.
	assertElement(root, 'xliff', xliffNamespace, '$')
	assertAttribute(root, 'version', '$', '2.1')
	const sourceLocale = requireAttribute(root, 'srcLang', '$')
	const targetLocale = getAttribute(root, 'trgLang')
	assertNoTextChildren(root, '$')
	const files = getElementChildren(root)
	if (files.length !== 1) throwXliff('$', 'An XLIFF catalog must contain exactly one file element.')
	assertElement(files[0]!, 'file', xliffNamespace, '$.file')

	// Turn the node tree into a translation catalog and ensure it's valid.
	const entries = parseEntries(files[0]!, '$.file')
	const catalog = { sourceLocale, ...(targetLocale && { targetLocale }), entries }
	const issues = validateCatalog(catalog)
	if (issues.length > 0) throw new InvalidXliffError(issues)
	return catalog
}

/*
 * General parsing.
 */

// Turn an XML string into an XML node tree
function parseXml(xml: string): XmlElement {
	const parser = new SaxesParser({ xmlns: true })

	// Set up storage variables.
	const stack: XmlElement[] = []
	let root: XmlElement | undefined
	let parseError: Error | undefined

	// Describe how to deal with various tags.
	parser.on('opentag', (tag: SaxesTagNS) => {
		// Build the element.
		const element: XmlElement = {
			localName: tag.local,
			namespace: tag.uri,
			attributes: Object.values(tag.attributes).map(attribute => ({ localName: attribute.local, namespace: attribute.uri, value: attribute.value })),
			children: [],
		}

		// Add it to its parent (or make it root if no parent exists).
		const parent = stack.at(-1)
		if (parent) parent.children.push(element)
		else if (root) throw new Error('Multiple root elements are not supported.')
		else root = element
		stack.push(element)
	})
	parser.on('text', text => stack.at(-1)?.children.push(text))
	parser.on('cdata', text => stack.at(-1)?.children.push(text))
	parser.on('closetag', () => { stack.pop() })
	parser.on('doctype', () => { throw new Error('DOCTYPE declarations are not supported.') })
	parser.on('error', error => { parseError = error })

	// Read in the file, turning it into a node tree.
	try {
		parser.write(xml).close()
	} catch (error) {
		parseError = error instanceof Error ? error : new Error(String(error))
	}
	if (parseError) throw new InvalidXliffError([{ path: '$', message: `Malformed XML: ${parseError.message}` }])
	if (!root) throwXliff('$', 'The document has no root element.')
	return root
}

/*
 * Parsing for specific components.
 */

// Parse XML entries into catalog entries.
function parseEntries(element: XmlElement, path: string): CatalogEntry[] {
	assertNoTextChildren(element, path)
	return getElementChildren(element).map((child, index) => {
		const childPath = `${path}[${index}]`
		if (child.localName === 'group' && child.namespace === xliffNamespace) return parseGroup(child, childPath)
		if (child.localName === 'unit' && child.namespace === xliffNamespace) return parseUnit(child, childPath)
		throwXliff(childPath, `Unexpected ${qualifiedName(child)} element.`)
	})
}

// Parse a group tag into a catalog group.
function parseGroup(element: XmlElement, path: string): CatalogGroup {
	return {
		type: 'group',
		id: requireAttribute(element, 'id', path),
		entries: parseEntries(element, `${path}.entries`),
	}
}

// Parse a unit tag into a catalog unit.
function parseUnit(element: XmlElement, path: string): CatalogUnit {
	const id = requireAttribute(element, 'id', path)

	// Make sure that the unit only contains one segment tag.
	assertNoTextChildren(element, path)
	const children = getElementChildren(element)
	if (children.length !== 1 || children[0]!.localName !== 'segment' || children[0]!.namespace !== xliffNamespace) throwXliff(path, 'A unit must contain exactly one segment element.')

	// Make sure that the segment only has a source tag and an optional target tag.
	const segment = children[0]!
	assertNoTextChildren(segment, `${path}.segment`)
	const segmentChildren = getElementChildren(segment)
	const sources = segmentChildren.filter(child => child.localName === 'source' && child.namespace === xliffNamespace)
	const targets = segmentChildren.filter(child => child.localName === 'target' && child.namespace === xliffNamespace)
	if (sources.length !== 1) throwXliff(`${path}.segment`, 'A segment must contain exactly one source element.')
	if (targets.length > 1) throwXliff(`${path}.segment`, 'A segment must not contain multiple target elements.')
	if (segmentChildren.length !== sources.length + targets.length) throwXliff(`${path}.segment`, 'A segment contains an unsupported element.')

	// Parse the source message.
	const source = parseMessage(sources[0]!.children, `${path}.source`)

	// If there is a target element, parse the target message with its corresponding fingerprints.
	const targetElement = targets[0]
	const contentFingerprint = targetElement && requireAttribute(targetElement, 'sourceContentFingerprint', `${path}.target`, stepWiseNamespace)
	const structureFingerprint = targetElement && requireAttribute(targetElement, 'sourceStructureFingerprint', `${path}.target`, stepWiseNamespace)
	const target = targetElement && contentFingerprint && structureFingerprint ? {
		message: parseMessage(targetElement.children, `${path}.target`),
		reviewedSourceContentFingerprint: contentFingerprint,
		reviewedSourceStructureFingerprint: structureFingerprint,
	} : undefined

	// Return the catalog unit as a result.
	return { type: 'unit', id, source, ...(target && { target }) }
}

// Turn an XML message node into a message object.
function parseMessage(nodes: readonly XmlNode[], path: string): Message {
	return nodes.flatMap((node, index): MessageNode[] => {
		if (typeof node === 'string') return node.length > 0 ? [{ type: 'text', value: node }] : []
		return [parseInlineNode(node, `${path}[${index}]`)]
	})
}

// Turn an inline node (so a ph or pc tag) into a message node object.
function parseInlineNode(element: XmlElement, path: string): MessageNode {
	assertInlineElement(element, path)
	const subType = requireAttribute(element, 'subType', path)
	if (element.localName === 'ph') return parsePlaceholder(element, subType, path)
	if (subType === 'swi18n:plural') return parsePlural(element, path)
	if (subType === 'swi18n:select') return parseSelect(element, path)
	if (subType === 'swi18n:slot' || subType.startsWith('swi18n:plural-') || subType === 'swi18n:select-branch') throwXliff(path, `${subType} is only valid inside its parent construct.`)
	return parseComponent(element, subType, path)
}

// Turn a placeholder (ph) XML tag into a message node object.
function parsePlaceholder(element: XmlElement, subType: string, path: string): MessageNode {
	if (element.children.length > 0) throwXliff(path, 'Placeholder elements must not contain content.')
	if (subType === variableSubType) return { type: 'variable', name: requireAttribute(element, 'name', path, stepWiseNamespace) }
	return createComponent(element, subType, {}, path)
}

// Turn a component (pc) XML tag into a message node object.
function parseComponent(element: XmlElement, subType: string, path: string): MessageNode {
	// If the element indicated a slot attribute, it only has one slot. Interpret its children as that slot.
	const slot = getAttribute(element, 'slot', stepWiseNamespace)
	if (slot) return createComponent(element, subType, { [slot]: parseMessage(element.children, `${path}.slots.${slot}`) }, path)

	// Otherwise, the slot has multiple children. Walk through the tags to interpret them.
	assertNoTextChildren(element, path)
	const children = getElementChildren(element)
	if (children.length === 0 && element.children.some(child => typeof child === 'string' && child.length > 0)) throwXliff(path, 'A component containing text must identify its translated slot.')
	const slots = Object.fromEntries(children.map((child, index) => {
		if (requireAttribute(child, 'subType', `${path}[${index}]`) !== 'swi18n:slot') throwXliff(`${path}[${index}]`, 'Components with multiple slots may only contain slot elements.')
		const name = requireAttribute(child, 'name', `${path}[${index}]`, stepWiseNamespace)
		return [name, parseMessage(child.children, `${path}.slots.${name}`)]
	}))
	if (new Set(Object.keys(slots)).size !== children.length) throwXliff(path, 'Component slot names must be unique.')
	return createComponent(element, subType, slots, path)
}

// Helper function to set up a component with the given subType, slots and path.
function createComponent(element: XmlElement, subType: string, slots: Record<string, Message>, path: string): MessageNode {
	if (!subType.startsWith(componentSubTypePrefix)) throwXliff(path, `Unknown inline subtype "${subType}".`)
	const component = subType.slice(componentSubTypePrefix.length)
	if (!component) throwXliff(path, 'Component subtypes must include a component name.')
	const copyOf = getAttribute(element, 'copyOf')
	return {
		type: 'component',
		id: requireAttribute(element, 'id', path),
		component,
		slots,
		...(copyOf && { copyOf }),
	}
}

// Turn an XML plurals tag into the corresponding plurals message node.
function parsePlural(element: XmlElement, path: string): MessageNode {
	// Iterate through the children and check if they're branches or exact branches. Add them to the respective map.
	const branches: Record<string, Message> = {}
	const exactBranches: Record<string, Message> = {}
	assertNoTextChildren(element, path)
	getElementChildren(element).forEach((branch, index) => {
		const branchPath = `${path}.branches[${index}]`
		const subType = requireAttribute(branch, 'subType', branchPath)

		// Exact branches are added to the exact branch map.
		if (subType === 'swi18n:plural-exact') {
			const value = requireAttribute(branch, 'value', branchPath, stepWiseNamespace)
			if (exactBranches[value]) throwXliff(branchPath, `Duplicate exact plural branch "${value}".`)
			exactBranches[value] = parseMessage(branch.children, branchPath)
			return
		}

		// Regular branches have their category checked, and are added to the branches map.
		const category = subType.replace(/^swi18n:plural-/, '')
		if (!pluralCategories.includes(category as typeof pluralCategories[number])) throwXliff(branchPath, `Unknown plural branch subtype "${subType}".`)
		if (branches[category]) throwXliff(branchPath, `Duplicate plural branch "${category}".`)
		branches[category] = parseMessage(branch.children, branchPath)
	})

	// Check the form.
	const form = getAttribute(element, 'form', stepWiseNamespace) ?? 'cardinal'
	if (form !== 'cardinal' && form !== 'ordinal') throwXliff(path, `Unknown plural form "${form}".`)

	// Return the result as a message node object.
	return {
		type: 'plural',
		variable: requireAttribute(element, 'variable', path, stepWiseNamespace),
		branches: branches as Extract<MessageNode, { type: 'plural' }>['branches'],
		...(Object.keys(exactBranches).length > 0 && { exactBranches }),
		form,
	}
}

// Turn an XML select tag into the corresponding select message node.
function parseSelect(element: XmlElement, path: string): MessageNode {
	// Check all branches and add them to the branches map.
	const branches: Record<string, Message> = {}
	assertNoTextChildren(element, path)
	getElementChildren(element).forEach((branch, index) => {
		const branchPath = `${path}.branches[${index}]`
		if (requireAttribute(branch, 'subType', branchPath) !== 'swi18n:select-branch') throwXliff(branchPath, 'Selects may only contain select branches.')
		const value = requireAttribute(branch, 'value', branchPath, stepWiseNamespace)
		if (branches[value]) throwXliff(branchPath, `Duplicate select branch "${value}".`)
		branches[value] = parseMessage(branch.children, branchPath)
	})

	// Return the result as a select message node.
	return {
		type: 'select',
		variable: requireAttribute(element, 'variable', path, stepWiseNamespace),
		branches: branches as Extract<MessageNode, { type: 'select' }>['branches'],
	}
}

/*
 * Assertion functions.
 */

// Throw if the element has text children (of nonzero length).
function assertNoTextChildren(element: XmlElement, path: string): void {
	const nonWhitespaceText = element.children.find(child => typeof child === 'string' && child.trim().length > 0)
	if (nonWhitespaceText) throwXliff(path, 'Only XML elements are allowed here.')
}

// Throw if the element doesn't have the right name or namespace.
function assertElement(element: XmlElement, localName: string, namespace: string, path: string): void {
	if (element.localName !== localName || element.namespace !== namespace) throwXliff(path, `Expected a ${localName} element in the XLIFF namespace.`)
}

// Throw if an element is not a valid inline (so ph or pc) element.
function assertInlineElement(element: XmlElement, path: string): void {
	if (element.namespace !== xliffNamespace || (element.localName !== 'ph' && element.localName !== 'pc')) throwXliff(path, `Unsupported inline element ${qualifiedName(element)}.`)
}

// Throw if an element's attribute does not have the right value.
function assertAttribute(element: XmlElement, name: string, path: string, expected: string): void {
	const value = requireAttribute(element, name, path)
	if (value !== expected) throwXliff(`${path}.@${name}`, `Expected "${expected}", received "${value}".`)
}

// Throw if an element is missing an attribute.
function requireAttribute(element: XmlElement, name: string, path: string, namespace = ''): string {
	const value = getAttribute(element, name, namespace)
	if (value === undefined || value.length === 0) throwXliff(`${path}.@${name}`, `The ${name} attribute is required.`)
	return value
}

// Helper that throws Xliff Errors.
function throwXliff(path: string, message: string): never {
	throw new InvalidXliffError([{ path, message }])
}

/*
 * XML extraction functions.
 */

// Get only the non-string children.
function getElementChildren(element: XmlElement): XmlElement[] {
	return element.children.filter((child): child is XmlElement => typeof child !== 'string')
}

// Get the value of an attribute with the given name and namespace.
function getAttribute(element: XmlElement, name: string, namespace = ''): string | undefined {
	return element.attributes.find(attribute => attribute.localName === name && attribute.namespace === namespace)?.value
}

// Add an element's name space to its tag name if it exists. This is used in supporting setting up error messages.
function qualifiedName(element: XmlElement): string {
	return element.namespace ? `{${element.namespace}}${element.localName}` : element.localName
}
