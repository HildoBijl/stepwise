import { type SaxesAttributeNS, type SaxesTagNS, SaxesParser } from 'saxes'

import { type Catalog, type CatalogUnit } from '../catalog/types.ts'
import { validateCatalog } from '../catalog/validation.ts'
import { type Message, type MessageNode, pluralCategories } from '../message/types.ts'
import { componentSubTypePrefix, stepWiseNamespace, variableSubType, xliffNamespace } from './constants.ts'
import { type XliffValidationIssue, InvalidXliffError } from './errors.ts'

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

// Parse and validate a Step-Wise XLIFF 2.1 catalog.
export function parseXliff(xml: string): Catalog {
	const root = parseXml(xml)
	expectElement(root, 'xliff', xliffNamespace, '$')
	expectAttribute(root, 'version', '$', '2.1')
	const sourceLocale = requireAttribute(root, 'srcLang', '$')
	const targetLocale = getAttribute(root, 'trgLang')
	const files = getStructuralChildren(root, '$')
	if (files.length !== 1) throwXliff('$', 'An XLIFF catalog must contain exactly one file element.')
	expectElement(files[0]!, 'file', xliffNamespace, '$.file')

	const units: CatalogUnit[] = []
	parseContainer(files[0]!, [], '$.file', units)
	const catalog = { sourceLocale, ...(targetLocale && { targetLocale }), units }
	const issues = validateCatalog(catalog)
	if (issues.length > 0) throw new InvalidXliffError(issues)
	return catalog
}

function parseContainer(element: XmlElement, groupPath: readonly string[], path: string, units: CatalogUnit[]): void {
	getStructuralChildren(element, path).forEach((child, index) => {
		const childPath = `${path}[${index}]`
		if (child.localName === 'group' && child.namespace === xliffNamespace) {
			const id = requireAttribute(child, 'id', childPath)
			parseContainer(child, [...groupPath, id], `${path}.group:${id}`, units)
			return
		}
		if (child.localName === 'unit' && child.namespace === xliffNamespace) {
			units.push(parseUnit(child, groupPath, childPath))
			return
		}
		throwXliff(childPath, `Unexpected ${qualifiedName(child)} element.`)
	})
}

function parseUnit(element: XmlElement, groupPath: readonly string[], path: string): CatalogUnit {
	const id = requireAttribute(element, 'id', path)
	const children = getStructuralChildren(element, path)
	if (children.length !== 1 || children[0]!.localName !== 'segment' || children[0]!.namespace !== xliffNamespace)
		throwXliff(path, 'A unit must contain exactly one segment element.')

	const segment = children[0]!
	const segmentChildren = getStructuralChildren(segment, `${path}.segment`)
	const sources = segmentChildren.filter(child => child.localName === 'source' && child.namespace === xliffNamespace)
	const targets = segmentChildren.filter(child => child.localName === 'target' && child.namespace === xliffNamespace)
	if (sources.length !== 1) throwXliff(`${path}.segment`, 'A segment must contain exactly one source element.')
	if (targets.length > 1) throwXliff(`${path}.segment`, 'A segment must not contain multiple target elements.')
	if (segmentChildren.length !== sources.length + targets.length) throwXliff(`${path}.segment`, 'A segment contains an unsupported element.')

	const source = parseMessage(sources[0]!.children, `${path}.source`)
	const targetElement = targets[0]
	const contentFingerprint = targetElement && requireAttribute(targetElement, 'sourceContentFingerprint', `${path}.target`, stepWiseNamespace)
	const structureFingerprint = targetElement && requireAttribute(targetElement, 'sourceStructureFingerprint', `${path}.target`, stepWiseNamespace)
	const target = targetElement && contentFingerprint && structureFingerprint ? {
		message: parseMessage(targetElement.children, `${path}.target`),
		reviewedSourceContentFingerprint: contentFingerprint,
		reviewedSourceStructureFingerprint: structureFingerprint,
	} : undefined

	return { id, ...(groupPath.length > 0 && { groupPath }), source, ...(target && { target }) }
}

function parseMessage(nodes: readonly XmlNode[], path: string): Message {
	return nodes.flatMap((node, index): MessageNode[] => {
		if (typeof node === 'string') return node.length > 0 ? [{ type: 'text', value: node }] : []
		return [parseInlineNode(node, `${path}[${index}]`)]
	})
}

function parseInlineNode(element: XmlElement, path: string): MessageNode {
	expectInlineElement(element, path)
	const subType = requireAttribute(element, 'subType', path)
	if (element.localName === 'ph') return parsePlaceholder(element, subType, path)
	if (subType === 'swi18n:plural') return parsePlural(element, path)
	if (subType === 'swi18n:select') return parseSelect(element, path)
	if (subType === 'swi18n:slot' || subType.startsWith('swi18n:plural-') || subType === 'swi18n:select-branch')
		throwXliff(path, `${subType} is only valid inside its parent construct.`)
	return parseComponent(element, subType, path)
}

function parsePlaceholder(element: XmlElement, subType: string, path: string): MessageNode {
	if (element.children.length > 0) throwXliff(path, 'Placeholder elements must not contain content.')
	if (subType === variableSubType) return { type: 'variable', name: requireAttribute(element, 'name', path, stepWiseNamespace) }
	return createComponent(element, subType, {}, path)
}

function parseComponent(element: XmlElement, subType: string, path: string): MessageNode {
	const slot = getAttribute(element, 'slot', stepWiseNamespace)
	if (slot) return createComponent(element, subType, { [slot]: parseMessage(element.children, `${path}.slots.${slot}`) }, path)

	const children = getInlineElements(element, path)
	if (children.length === 0 && element.children.some(child => typeof child === 'string' && child.length > 0))
		throwXliff(path, 'A component containing text must identify its translated slot.')
	const slots = Object.fromEntries(children.map((child, index) => {
		if (requireAttribute(child, 'subType', `${path}[${index}]`) !== 'swi18n:slot') throwXliff(`${path}[${index}]`, 'Components with multiple slots may only contain slot elements.')
		const name = requireAttribute(child, 'name', `${path}[${index}]`, stepWiseNamespace)
		return [name, parseMessage(child.children, `${path}.slots.${name}`)]
	}))
	if (new Set(Object.keys(slots)).size !== children.length) throwXliff(path, 'Component slot names must be unique.')
	return createComponent(element, subType, slots, path)
}

function createComponent(element: XmlElement, subType: string, slots: Record<string, Message>, path: string): MessageNode {
	if (!subType.startsWith(componentSubTypePrefix)) throwXliff(path, `Unknown inline subtype "${subType}".`)
	const component = subType.slice(componentSubTypePrefix.length)
	if (!component) throwXliff(path, 'Component subtypes must include a component name.')
	return {
		type: 'component',
		id: requireAttribute(element, 'id', path),
		component,
		slots,
		...(getAttribute(element, 'copyOf') && { copyOf: getAttribute(element, 'copyOf') }),
	}
}

function parsePlural(element: XmlElement, path: string): MessageNode {
	const branches: Record<string, Message> = {}
	const exactBranches: Record<string, Message> = {}
	getInlineElements(element, path).forEach((branch, index) => {
		const branchPath = `${path}.branches[${index}]`
		const subType = requireAttribute(branch, 'subType', branchPath)
		if (subType === 'swi18n:plural-exact') {
			const value = requireAttribute(branch, 'value', branchPath, stepWiseNamespace)
			if (exactBranches[value]) throwXliff(branchPath, `Duplicate exact plural branch "${value}".`)
			exactBranches[value] = parseMessage(branch.children, branchPath)
			return
		}
		const category = subType.replace(/^swi18n:plural-/, '')
		if (!pluralCategories.includes(category as typeof pluralCategories[number])) throwXliff(branchPath, `Unknown plural branch subtype "${subType}".`)
		if (branches[category]) throwXliff(branchPath, `Duplicate plural branch "${category}".`)
		branches[category] = parseMessage(branch.children, branchPath)
	})
	const form = getAttribute(element, 'form', stepWiseNamespace) ?? 'cardinal'
	if (form !== 'cardinal' && form !== 'ordinal') throwXliff(path, `Unknown plural form "${form}".`)
	return {
		type: 'plural',
		variable: requireAttribute(element, 'variable', path, stepWiseNamespace),
		branches: branches as Extract<MessageNode, { type: 'plural' }>['branches'],
		...(Object.keys(exactBranches).length > 0 && { exactBranches }),
		form,
	}
}

function parseSelect(element: XmlElement, path: string): MessageNode {
	const branches: Record<string, Message> = {}
	getInlineElements(element, path).forEach((branch, index) => {
		const branchPath = `${path}.branches[${index}]`
		if (requireAttribute(branch, 'subType', branchPath) !== 'swi18n:select-branch') throwXliff(branchPath, 'Selects may only contain select branches.')
		const value = requireAttribute(branch, 'value', branchPath, stepWiseNamespace)
		if (branches[value]) throwXliff(branchPath, `Duplicate select branch "${value}".`)
		branches[value] = parseMessage(branch.children, branchPath)
	})
	return {
		type: 'select',
		variable: requireAttribute(element, 'variable', path, stepWiseNamespace),
		branches: branches as Extract<MessageNode, { type: 'select' }>['branches'],
	}
}

function parseXml(xml: string): XmlElement {
	const parser = new SaxesParser({ xmlns: true })
	const stack: XmlElement[] = []
	let root: XmlElement | undefined
	let parseError: Error | undefined

	parser.on('opentag', (tag: SaxesTagNS) => {
		const element: XmlElement = {
			localName: tag.local,
			namespace: tag.uri,
			attributes: Object.values(tag.attributes).map(attribute => toAttribute(attribute)),
			children: [],
		}
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

	try {
		parser.write(xml).close()
	} catch (error) {
		parseError = error instanceof Error ? error : new Error(String(error))
	}
	if (parseError) throw new InvalidXliffError([{ path: '$', message: `Malformed XML: ${parseError.message}` }])
	if (!root) throwXliff('$', 'The document has no root element.')
	return root
}

function toAttribute(attribute: SaxesAttributeNS): XmlAttribute {
	return { localName: attribute.local, namespace: attribute.uri, value: attribute.value }
}

function getStructuralChildren(element: XmlElement, path: string): XmlElement[] {
	const nonWhitespaceText = element.children.find(child => typeof child === 'string' && child.trim().length > 0)
	if (nonWhitespaceText) throwXliff(path, 'Text is not allowed in this structural element.')
	return element.children.filter((child): child is XmlElement => typeof child !== 'string')
}

function getInlineElements(element: XmlElement, path: string): XmlElement[] {
	const text = element.children.find(child => typeof child === 'string' && child.trim().length > 0)
	if (text) throwXliff(path, 'Text is not allowed between structural inline elements.')
	return element.children.filter((child): child is XmlElement => typeof child !== 'string')
}

function expectInlineElement(element: XmlElement, path: string): void {
	if (element.namespace !== xliffNamespace || (element.localName !== 'ph' && element.localName !== 'pc'))
		throwXliff(path, `Unsupported inline element ${qualifiedName(element)}.`)
}

function expectElement(element: XmlElement, localName: string, namespace: string, path: string): void {
	if (element.localName !== localName || element.namespace !== namespace) throwXliff(path, `Expected a ${localName} element in the XLIFF namespace.`)
}

function expectAttribute(element: XmlElement, name: string, path: string, expected: string): void {
	const value = requireAttribute(element, name, path)
	if (value !== expected) throwXliff(`${path}.@${name}`, `Expected "${expected}", received "${value}".`)
}

function requireAttribute(element: XmlElement, name: string, path: string, namespace = ''): string {
	const value = getAttribute(element, name, namespace)
	if (value === undefined || value.length === 0) throwXliff(`${path}.@${name}`, `The ${name} attribute is required.`)
	return value
}

function getAttribute(element: XmlElement, name: string, namespace = ''): string | undefined {
	return element.attributes.find(attribute => attribute.localName === name && attribute.namespace === namespace)?.value
}

function qualifiedName(element: XmlElement): string {
	return element.namespace ? `{${element.namespace}}${element.localName}` : element.localName
}

function throwXliff(path: string, message: string): never {
	throw new InvalidXliffError([{ path, message }])
}
