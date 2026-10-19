import { type Message, type TranslationStatus } from '../message/types.ts'

export type Catalog = {
	units: readonly CatalogUnit[]
	sourceLocale: string
	targetLocale?: string
}

export type CatalogUnit = {
	id: string
	groupPath?: readonly string[]
	source: Message
	target?: CatalogTarget
}

export type CatalogTarget = {
	message: Message
	reviewedSourceContentFingerprint: string
	reviewedSourceStructureFingerprint: string
}

export type CatalogUnitStatus = Extract<TranslationStatus, 'current' | 'missing' | 'needs-review' | 'stale'>
