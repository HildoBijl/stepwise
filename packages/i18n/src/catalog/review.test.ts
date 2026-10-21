import { describe, expect, it } from 'vitest'

import { getMessageContentFingerprint, getMessageStructureFingerprint } from '../message/signatures.ts'
import { type Catalog } from './types.ts'
import { reviewAllCatalogUnits, reviewCatalogUnit } from './review.ts'

const source = [{ type: 'text', value: 'Current source' }] as const
const oldFingerprint = '0000000000000000'
const target = {
	message: [{ type: 'text', value: 'Huidige vertaling' }],
	reviewedSourceContentFingerprint: oldFingerprint,
	reviewedSourceStructureFingerprint: oldFingerprint,
} as const

const catalog: Catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [{
	type: 'group',
	id: 'group',
	entries: [
		{ type: 'unit', id: 'translated', source, target },
		{ type: 'unit', id: 'missing', source },
	],
}] }

describe('Catalog reviews', () => {
	it('records the current source fingerprints for one reviewed target', () => {
		const reviewed = reviewCatalogUnit(catalog, ['group'], 'translated')
		const group = reviewed.entries[0]
		if (group?.type !== 'group' || group.entries[0]?.type !== 'unit') throw new Error('Expected the translated unit.')
		expect(group.entries[0].target).toEqual({
			message: target.message,
			reviewedSourceContentFingerprint: getMessageContentFingerprint(source),
			reviewedSourceStructureFingerprint: getMessageStructureFingerprint(source),
		})
	})

	it('reviews all existing targets while leaving missing targets unchanged', () => {
		const reviewed = reviewAllCatalogUnits(catalog)
		const group = reviewed.entries[0]
		const originalGroup = catalog.entries[0]
		if (group?.type !== 'group' || originalGroup?.type !== 'group') throw new Error('Expected the translated group.')
		expect(group.entries[0]).not.toBe(originalGroup.entries[0])
		expect(group.entries[1]).toBe(originalGroup.entries[1])
	})

	it('rejects an individual unit without a target', () => {
		expect(() => reviewCatalogUnit(catalog, ['group'], 'missing')).toThrow('has no target to review')
	})

	it('reports the exact missing group or unit', () => {
		expect(() => reviewCatalogUnit(catalog, ['group', 'nested'], 'translated')).toThrow('Could not find translation group "group/nested".')
		expect(() => reviewCatalogUnit(catalog, ['group'], 'unknown')).toThrow('Could not find translation unit "group/unknown".')
	})

	it('refuses to review an incompatible target', () => {
		const incompatibleCatalog: Catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [{
			type: 'unit',
			id: 'variable',
			source: [{ type: 'variable', name: 'current' }],
			target: { ...target, message: [{ type: 'variable', name: 'outdated' }] },
		}] }
		expect(() => reviewCatalogUnit(incompatibleCatalog, [], 'variable')).toThrow('Translation references unknown variable "outdated".')
	})
})
