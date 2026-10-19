import { type Message, type TranslationStatus } from '../message/types.ts'

export type Catalog = {
	sourceLocale: string
	targetLocale?: string
	entries: readonly CatalogEntry[]
}

export type CatalogEntry = CatalogGroup | CatalogUnit

export type CatalogGroup = {
	type: 'group'
	id: string
	entries: readonly CatalogEntry[]
}

export type CatalogUnit = {
	type: 'unit'
	id: string
	source: Message
	target?: CatalogTarget
}

export type CatalogTarget = {
	message: Message
	reviewedSourceContentFingerprint: string
	reviewedSourceStructureFingerprint: string
}

export type CatalogUnitStatus = Extract<TranslationStatus, 'current' | 'missing' | 'needs-review' | 'stale'>
