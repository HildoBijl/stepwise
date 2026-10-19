import { describe, expect, it } from 'vitest'

import { getCatalogUnits, visitCatalogUnits } from './traversal.ts'
import { type Catalog } from './types.ts'
import { InvalidCatalogError, assertValidCatalog, validateCatalog } from './validation.ts'

describe('catalog validation', () => {
	it('returns all catalog issues without throwing', () => {
		const catalog = {
			sourceLocale: '',
			entries: [{
				type: 'group',
				id: '',
				entries: [{
					type: 'unit',
					id: '',
					source: [{ type: 'plural', variable: 'count', branches: { one: [] } }],
					target: {
						message: [],
						reviewedSourceContentFingerprint: 'invalid',
						reviewedSourceStructureFingerprint: 'invalid',
					},
				}],
			}],
		} as unknown as Catalog

		expect(validateCatalog(catalog).map(issue => issue.message)).toEqual([
			'Invalid locale "".',
			'Group IDs must not be empty.',
			'Unit IDs must not be empty.',
			'Plural messages must define an other branch.',
			'Source-only catalogs cannot contain targets.',
			'Fingerprints must contain 16 lowercase hexadecimal characters.',
			'Fingerprints must contain 16 lowercase hexadecimal characters.',
		])
	})

	it('throws all collected issues when asserted', () => {
		const catalog: Catalog = { sourceLocale: 'invalid_locale', entries: [] }
		expect(() => assertValidCatalog(catalog)).toThrow(InvalidCatalogError)
	})
})

describe('catalog traversal', () => {
	it('visits nested units in catalog order with their group paths', () => {
		const catalog: Catalog = {
			sourceLocale: 'en',
			entries: [
				{ type: 'unit', id: 'introduction', source: [] },
				{ type: 'group', id: 'exercise', entries: [{ type: 'unit', id: 'problem', source: [] }] },
			],
		}
		const visited: [string, readonly string[]][] = []
		visitCatalogUnits(catalog, (unit, groupPath) => visited.push([unit.id, groupPath]))

		expect(visited).toEqual([['introduction', []], ['problem', ['exercise']]])
		expect(getCatalogUnits(catalog).map(unit => unit.id)).toEqual(['introduction', 'problem'])
	})
})
