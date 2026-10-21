// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { applySourceRegistrations } from './sourcePlugin.mjs'

const originalCatalog = {
	sourceLocale: 'en',
	entries: [{ type: 'unit', id: 'existing', source: [{ type: 'text', value: 'Existing' }] }],
}

describe('i18n source Vite plugin', () => {
	it('adds nested source units while retaining existing entries', () => {
		const result = applySourceRegistrations(originalCatalog, [{
			folder: ['pages'],
			catalog: 'test',
			group: ['trial'],
			id: 'new',
			source: [{ type: 'text', value: 'New' }],
		}])

		expect(result.changed).toBe(true)
		expect(result.catalog.entries).toEqual([
			originalCatalog.entries[0],
			{ type: 'group', id: 'trial', entries: [{ type: 'unit', id: 'new', source: [{ type: 'text', value: 'New' }] }] },
		])
	})

	it('does not rewrite an unchanged source', () => {
		const result = applySourceRegistrations(originalCatalog, [{
			folder: ['pages'],
			catalog: 'test',
			group: [],
			id: 'existing',
			source: [{ type: 'text', value: 'Existing' }],
		}])
		expect(result).toEqual({ catalog: originalCatalog, changed: false })
	})
})
