import { type Catalog, type CatalogEntry, type CatalogUnit } from '../catalog/types.ts'
import { assertValidCatalog } from '../catalog/validation.ts'
import { normalizeMessage } from '../message/normalization.ts'
import { type ComponentNode, type Message, type MessageNode, type PluralNode, type SelectNode, pluralCategories } from '../message/types.ts'
import { componentSubTypePrefix, stepWiseNamespace, variableSubType } from './constants.ts'

type SerializationContext = {
	usedIds: Set<string>
	nextGeneratedId: number
}

/*
 * Public functions.
 */

// Serialize a catalog to the Step-Wise XLIFF 2.1 profile.
export function serializeXliff(catalog: Catalog): string {
	assertValidCatalog(catalog)
	const attributes = [
		'xmlns="urn:oasis:names:tc:xliff:document:2.0"',
		`xmlns:swi18n="${stepWiseNamespace}"`,
		'version="2.1"',
		`srcLang="${escapeAttribute(catalog.sourceLocale)}"`,
		...(catalog.targetLocale ? [`trgLang="${escapeAttribute(catalog.targetLocale)}"`] : []),
	]
	const contents = serializeEntries(catalog.entries, 2)
	return `<?xml version="1.0" encoding="UTF-8"?>\n<xliff ${attributes.join(' ')}>\n\t<file id="catalog">${contents}\n\t</file>\n</xliff>\n`
}

/*
 * Serialization functions for specific types.
 */

// Serialize a list of entries: either groups or units.
function serializeEntries(entries: readonly CatalogEntry[], depth: number): string {
	const indentation = '\t'.repeat(depth)
	return entries.map(entry => {
		if (entry.type === 'unit') return `\n${serializeUnit(entry, depth)}`
		const contents = serializeEntries(entry.entries, depth + 1)
		return `\n${indentation}<group id="${escapeAttribute(entry.id)}">${contents}\n${indentation}</group>`
	}).join('')
}

// Serialize a unit: serialize its source and its target messages.
function serializeUnit(unit: CatalogUnit, depth: number): string {
	const indentation = '\t'.repeat(depth)

	// Serialize the source.
	const normalizedSource = normalizeMessage(unit.source)
	const source = `\n${indentation}\t\t<source>${serializeMessage(normalizedSource, createSerializationContext(normalizedSource))}</source>`

	// Serialize the target (if it exists).
	let target = ''
	if (unit.target) {
		const normalizedTarget = normalizeMessage(unit.target.message)
		target = `\n${indentation}\t\t<target swi18n:sourceContentFingerprint="${escapeAttribute(unit.target.reviewedSourceContentFingerprint)}" swi18n:sourceStructureFingerprint="${escapeAttribute(unit.target.reviewedSourceStructureFingerprint)}">${serializeMessage(normalizedTarget, createSerializationContext(normalizedTarget))}</target>`
	}

	// Wrap it all in a container tag.
	return `${indentation}<unit id="${escapeAttribute(unit.id)}">\n${indentation}\t<segment>${source}${target}\n${indentation}\t</segment>\n${indentation}</unit>`
}

// Serialize a message: serialize all its nodes.
function serializeMessage(message: Message, context: SerializationContext): string {
	return message.map(node => serializeNode(node, context)).join('')
}

// Serialize a node depending on its type.
function serializeNode(node: MessageNode, context: SerializationContext): string {
	switch (node.type) {
		case 'text': return escapeText(node.value)
		case 'variable': return `<ph id="${nextGeneratedId(context)}" type="ui" subType="${variableSubType}" swi18n:name="${escapeAttribute(node.name)}"/>`
		case 'component': return serializeComponent(node, context)
		case 'plural': return serializePlural(node, context)
		case 'select': return serializeSelect(node, context)
	}
}

// Serialize a component: serialize the slots and add them to its contents.
function serializeComponent(node: ComponentNode, context: SerializationContext): string {
	const commonAttributes = `id="${escapeAttribute(node.id)}" type="ui" subType="${componentSubTypePrefix}${escapeAttribute(node.component)}"${node.copyOf ? ` copyOf="${escapeAttribute(node.copyOf)}"` : ''}`

	// On 0 or 1 slots, set up and return the tag (with contents if needed).
	const slots = Object.entries(node.slots)
	if (slots.length === 0) return `<ph ${commonAttributes}/>`
	if (slots.length === 1) {
		const [name, message] = slots[0]!
		return `<pc ${commonAttributes} swi18n:slot="${escapeAttribute(name)}">${serializeMessage(message, context)}</pc>`
	}

	// On multiple slots, wrap each slot in a tag and add as contents.
	const contents = slots.map(([name, message]) => `<pc id="${nextGeneratedId(context)}" type="other" subType="swi18n:slot" swi18n:name="${escapeAttribute(name)}">${serializeMessage(message, context)}</pc>`).join('')
	return `<pc ${commonAttributes}>${contents}</pc>`
}

// Serialize a plural: wrap its branches and exact branches into their own tags and add to a container tag.
function serializePlural(node: PluralNode, context: SerializationContext): string {
	const id = nextGeneratedId(context)

	// Add the plural categories that exist within this plural node.
	const branches = pluralCategories.flatMap(category => {
		const message = node.branches[category]
		return message ? [`<pc id="${nextGeneratedId(context)}" type="other" subType="swi18n:plural-${category}">${serializeMessage(message, context)}</pc>`] : []
	})

	// Add the exact branches of this plural node.
	const exactBranches = Object.entries(node.exactBranches ?? {}).map(([value, message]) => `<pc id="${nextGeneratedId(context)}" type="other" subType="swi18n:plural-exact" swi18n:value="${escapeAttribute(value)}">${serializeMessage(message, context)}</pc>`)

	// Wrap in a tag and return the result.
	return `<pc id="${id}" type="other" subType="swi18n:plural" swi18n:variable="${escapeAttribute(node.variable)}" swi18n:form="${node.form ?? 'cardinal'}">${[...branches, ...exactBranches].join('')}</pc>`
}

// Serialize a select: serialize its branches and wrap them in a tag.
function serializeSelect(node: SelectNode, context: SerializationContext): string {
	const id = nextGeneratedId(context)
	const branches = Object.entries(node.branches).map(([value, message]) => `<pc id="${nextGeneratedId(context)}" type="other" subType="swi18n:select-branch" swi18n:value="${escapeAttribute(value)}">${serializeMessage(message, context)}</pc>`).join('')
	return `<pc id="${id}" type="other" subType="swi18n:select" swi18n:variable="${escapeAttribute(node.variable)}">${branches}</pc>`
}

/*
 * Support functions.
 */

// Set up a new context for a message, including a counter for generating IDs.
function createSerializationContext(message: Message): SerializationContext {
	const usedIds = new Set<string>()
	collectComponentIds(message, usedIds)
	return { usedIds, nextGeneratedId: 1 }
}

// Take a message and put all its IDs in the given set.
function collectComponentIds(message: Message, ids: Set<string>): void {
	message.forEach(node => {
		if (node.type === 'component') {
			ids.add(node.id)
			Object.values(node.slots).forEach(slot => collectComponentIds(slot, ids))
		} else if (node.type === 'plural') {
			Object.values(node.branches).forEach(branch => collectComponentIds(branch, ids))
			Object.values(node.exactBranches ?? {}).forEach(branch => collectComponentIds(branch, ids))
		} else if (node.type === 'select') {
			Object.values(node.branches).forEach(branch => collectComponentIds(branch, ids))
		}
	})
}

// Generate a new ID based on the context.
function nextGeneratedId(context: SerializationContext): string {
	let id: string
	do id = `x${context.nextGeneratedId++}`
	while (context.usedIds.has(id))
	context.usedIds.add(id)
	return id
}

// Escape XML-related characters (&, <, >).
function escapeText(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

// Escape attributes within a tag (also includes quotation marks).
function escapeAttribute(value: string): string {
	return escapeText(value).replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}
