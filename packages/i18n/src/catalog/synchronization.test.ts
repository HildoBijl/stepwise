import { describe, expect, it } from 'vitest'

import { getMessageContentFingerprint, getMessageStructureFingerprint } from '../message/signatures.ts'
import { type Catalog, type CatalogUnit } from './types.ts'
import { synchronizeCatalog, validateCatalogSynchronization } from './synchronization.ts'

const originalSource = [{ type: 'text', value: 'Original' }] as const
const changedSource = [{ type: 'text', value: 'Changed' }] as const
const target = {
	message: [{ type: 'text', value: 'Vertaald' }],
	reviewedSourceContentFingerprint: getMessageContentFingerprint(originalSource),
	reviewedSourceStructureFingerprint: getMessageStructureFingerprint(originalSource),
} as const

describe('Catalog synchronization', () => {
	it('creates a new target Catalog from the complete source hierarchy', () => {
		const sourceCatalog: Catalog = { sourceLocale: 'en', entries: [
			{ type: 'group', id: 'outer', entries: [
				{ type: 'group', id: 'inner', entries: [
					{ type: 'unit', id: 'message', source: originalSource },
				] },
			] },
		] }

		expect(synchronizeCatalog(sourceCatalog, 'nl')).toEqual({
			...sourceCatalog,
			targetLocale: 'nl',
		})
	})

	it('updates source entries, adds missing entries and retains translations and obsolete entries', () => {
		const sourceCatalog: Catalog = { sourceLocale: 'en', entries: [
			{ type: 'group', id: 'group', entries: [
				{ type: 'unit', id: 'existing', source: changedSource },
				{ type: 'unit', id: 'new', source: [{ type: 'text', value: 'New' }] },
			] },
		] }
		const targetCatalog: Catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [
			{ type: 'group', id: 'group', entries: [
				{ type: 'unit', id: 'existing', source: originalSource, target },
				{ type: 'unit', id: 'obsolete', source: [{ type: 'text', value: 'Obsolete' }] },
			] },
		] }

		const synchronized = synchronizeCatalog(sourceCatalog, 'nl', targetCatalog)
		const group = synchronized.entries[0]
		expect(group?.type).toBe('group')
		if (group?.type !== 'group') throw new Error('Expected a group.')
		expect(group.entries.map(entry => entry.id)).toEqual(['existing', 'new', 'obsolete'])
		expect((group.entries[0] as CatalogUnit).source).toBe(changedSource)
		expect((group.entries[0] as CatalogUnit).target).toBe(target)
	})

	it('retains obsolete entries inside nested target groups', () => {
		const sourceCatalog: Catalog = { sourceLocale: 'en', entries: [
			{ type: 'group', id: 'outer', entries: [
				{ type: 'group', id: 'inner', entries: [
					{ type: 'unit', id: 'current', source: originalSource },
				] },
			] },
		] }
		const targetCatalog: Catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [
			{ type: 'group', id: 'outer', entries: [
				{ type: 'group', id: 'inner', entries: [
					{ type: 'unit', id: 'current', source: originalSource },
					{ type: 'unit', id: 'obsolete', source: changedSource },
				] },
			] },
		] }

		const synchronized = synchronizeCatalog(sourceCatalog, 'nl', targetCatalog)
		const outer = synchronized.entries[0]
		if (outer?.type !== 'group') throw new Error('Expected the outer group.')
		const inner = outer.entries[0]
		if (inner?.type !== 'group') throw new Error('Expected the inner group.')
		expect(inner.entries.map(entry => entry.id)).toEqual(['current', 'obsolete'])
	})

	it('rejects conflicting entry types', () => {
		const sourceCatalog: Catalog = { sourceLocale: 'en', entries: [
			{ type: 'group', id: 'entry', entries: [] },
		] }
		const targetCatalog: Catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [
			{ type: 'unit', id: 'entry', source: originalSource },
		] }

		expect(() => synchronizeCatalog(sourceCatalog, 'nl', targetCatalog)).toThrow('A source group conflicts with a target unit.')
	})

	it('rejects target Catalogs with mismatched locales', () => {
		const sourceCatalog: Catalog = { sourceLocale: 'en', entries: [] }
		expect(() => synchronizeCatalog(sourceCatalog, 'nl', { sourceLocale: 'de', targetLocale: 'nl', entries: [] })).toThrow('does not match "en"')
		expect(() => synchronizeCatalog(sourceCatalog, 'nl', { sourceLocale: 'en', targetLocale: 'de', entries: [] })).toThrow('Expected target locale "nl"')
	})

	it('reports outdated source snapshots and every non-current translation', () => {
		const sourceCatalog: Catalog = { sourceLocale: 'en', entries: [
			{ type: 'unit', id: 'changed', source: changedSource },
			{ type: 'unit', id: 'missing', source: originalSource },
		] }
		const targetCatalog: Catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [
			{ type: 'unit', id: 'changed', source: originalSource, target },
			{ type: 'unit', id: 'missing', source: originalSource },
		] }

		expect(validateCatalogSynchronization(sourceCatalog, targetCatalog)).toEqual([
			{ path: '$.entries.changed.source', message: 'The target Catalog contains an outdated source snapshot.' },
			{ path: '$.entries.missing.target', message: 'Translation status is missing.' },
		])
	})
})
