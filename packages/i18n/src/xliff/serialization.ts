import { type Catalog, type CatalogUnit } from '../catalog/types.ts'
import { assertValidCatalog } from '../catalog/validation.ts'
import { normalizeMessage } from '../message/normalization.ts'
import { type ComponentNode, type Message, type MessageNode, pluralCategories } from '../message/types.ts'
import { componentSubTypePrefix, stepWiseNamespace, variableSubType } from './constants.ts'

type Group = {
	id: string
	groups: Map<string, Group>
	units: CatalogUnit[]
}

type SerializationContext = {
	usedIds: Set<string>
	nextGeneratedId: number
}

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
	const root = createRootGroup(catalog.units)
	const contents = serializeContainer(root, 2)
	return `<?xml version="1.0" encoding="UTF-8"?>\n<xliff ${attributes.join(' ')}>\n\t<file id="catalog">${contents}\n\t</file>\n</xliff>\n`
}

function serializeContainer(group: Group, depth: number): string {
	const indentation = '\t'.repeat(depth)
	const groups = [...group.groups.values()].map(child => {
		const contents = serializeContainer(child, depth + 1)
		return `\n${indentation}<group id="${escapeAttribute(child.id)}">${contents}\n${indentation}</group>`
	})
	const units = group.units.map(unit => `\n${serializeUnit(unit, depth)}`)
	return [...groups, ...units].join('')
}

function serializeUnit(unit: CatalogUnit, depth: number): string {
	const indentation = '\t'.repeat(depth)
	const normalizedSource = normalizeMessage(unit.source)
	const normalizedTarget = unit.target && normalizeMessage(unit.target.message)
	const source = serializeMessage(normalizedSource, createSerializationContext(normalizedSource))
	const target = unit.target
		? `\n${indentation}\t\t<target swi18n:sourceContentFingerprint="${escapeAttribute(unit.target.reviewedSourceContentFingerprint)}" swi18n:sourceStructureFingerprint="${escapeAttribute(unit.target.reviewedSourceStructureFingerprint)}">${serializeMessage(normalizedTarget!, createSerializationContext(normalizedTarget!))}</target>`
		: ''
	return `${indentation}<unit id="${escapeAttribute(unit.id)}">\n${indentation}\t<segment>\n${indentation}\t\t<source>${source}</source>${target}\n${indentation}\t</segment>\n${indentation}</unit>`
}

function serializeMessage(message: Message, context: SerializationContext): string {
	return message.map(node => serializeNode(node, context)).join('')
}

function serializeNode(node: MessageNode, context: SerializationContext): string {
	switch (node.type) {
		case 'text': return escapeText(node.value)
		case 'variable': return `<ph id="${nextGeneratedId(context)}" type="ui" subType="${variableSubType}" swi18n:name="${escapeAttribute(node.name)}"/>`
		case 'component': return serializeComponent(node, context)
		case 'plural': return serializePlural(node, context)
		case 'select': return serializeSelect(node, context)
	}
}

function serializeComponent(node: ComponentNode, context: SerializationContext): string {
	const commonAttributes = `id="${escapeAttribute(node.id)}" type="ui" subType="${componentSubTypePrefix}${escapeAttribute(node.component)}"${node.copyOf ? ` copyOf="${escapeAttribute(node.copyOf)}"` : ''}`
	const slots = Object.entries(node.slots)
	if (slots.length === 0) return `<ph ${commonAttributes}/>`
	if (slots.length === 1) {
		const [name, message] = slots[0]!
		return `<pc ${commonAttributes} swi18n:slot="${escapeAttribute(name)}">${serializeMessage(message, context)}</pc>`
	}

	const contents = slots.map(([name, message]) =>
		`<pc id="${nextGeneratedId(context)}" type="other" subType="swi18n:slot" swi18n:name="${escapeAttribute(name)}">${serializeMessage(message, context)}</pc>`).join('')
	return `<pc ${commonAttributes}>${contents}</pc>`
}

function serializePlural(node: Extract<MessageNode, { type: 'plural' }>, context: SerializationContext): string {
	const id = nextGeneratedId(context)
	const branches = pluralCategories.flatMap(category => {
		const message = node.branches[category]
		return message ? [`<pc id="${nextGeneratedId(context)}" type="other" subType="swi18n:plural-${category}">${serializeMessage(message, context)}</pc>`] : []
	})
	const exactBranches = Object.entries(node.exactBranches ?? {}).map(([value, message]) =>
		`<pc id="${nextGeneratedId(context)}" type="other" subType="swi18n:plural-exact" swi18n:value="${escapeAttribute(value)}">${serializeMessage(message, context)}</pc>`)
	return `<pc id="${id}" type="other" subType="swi18n:plural" swi18n:variable="${escapeAttribute(node.variable)}" swi18n:form="${node.form ?? 'cardinal'}">${[...branches, ...exactBranches].join('')}</pc>`
}

function serializeSelect(node: Extract<MessageNode, { type: 'select' }>, context: SerializationContext): string {
	const id = nextGeneratedId(context)
	const branches = Object.entries(node.branches).map(([value, message]) =>
		`<pc id="${nextGeneratedId(context)}" type="other" subType="swi18n:select-branch" swi18n:value="${escapeAttribute(value)}">${serializeMessage(message, context)}</pc>`).join('')
	return `<pc id="${id}" type="other" subType="swi18n:select" swi18n:variable="${escapeAttribute(node.variable)}">${branches}</pc>`
}

function createSerializationContext(message: Message): SerializationContext {
	const usedIds = new Set<string>()
	collectComponentIds(message, usedIds)
	return { usedIds, nextGeneratedId: 1 }
}

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

function nextGeneratedId(context: SerializationContext): string {
	let id: string
	do id = `x${context.nextGeneratedId++}`
	while (context.usedIds.has(id))
	context.usedIds.add(id)
	return id
}

function createRootGroup(units: readonly CatalogUnit[]): Group {
	const root: Group = { id: '', groups: new Map(), units: [] }
	units.forEach(unit => {
		let group = root
		unit.groupPath?.forEach(id => {
			let child = group.groups.get(id)
			if (!child) {
				child = { id, groups: new Map(), units: [] }
				group.groups.set(id, child)
			}
			group = child
		})
		group.units.push(unit)
	})
	return root
}

function escapeText(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function escapeAttribute(value: string): string {
	return escapeText(value).replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}
