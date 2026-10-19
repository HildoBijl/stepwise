import { describe, expect, it } from 'vitest'

import { type Catalog } from './types.ts'
import { InvalidCatalogError, assertValidCatalog, validateCatalog } from './validation.ts'

describe('catalog validation', () => {
	it('returns all catalog issues without throwing', () => {
		const catalog = {
			sourceLocale: '',
			units: [{
				id: '',
				groupPath: [''],
				source: [{ type: 'plural', variable: 'count', branches: { one: [] } }],
				target: {
					message: [],
					reviewedSourceContentFingerprint: 'invalid',
					reviewedSourceStructureFingerprint: 'invalid',
				},
			}],
		} as unknown as Catalog

		expect(validateCatalog(catalog).map(issue => issue.message)).toEqual([
			'Invalid locale "".',
			'A unit ID is required.',
			'Group IDs must not be empty.',
			'Plural messages must define an other branch.',
			'Source-only catalogs cannot contain targets.',
			'Fingerprints must contain 16 lowercase hexadecimal characters.',
			'Fingerprints must contain 16 lowercase hexadecimal characters.',
		])
	})

	it('throws all collected issues when asserted', () => {
		const catalog: Catalog = { sourceLocale: 'invalid_locale', units: [] }
		expect(() => assertValidCatalog(catalog)).toThrow(InvalidCatalogError)
	})
})
