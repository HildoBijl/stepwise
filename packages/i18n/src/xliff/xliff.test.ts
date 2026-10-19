import { describe, expect, it } from 'vitest'

import {
	type Catalog,
	type Message,
	getCatalogUnitStatus,
	getMessageContentFingerprint,
	getMessageStructureFingerprint,
} from '../index.ts'
import { InvalidXliffError, parseXliff, serializeXliff } from './index.ts'

const source: Message = [
	{ type: 'text', value: 'Use ' },
	{
		type: 'component',
		id: 'equation-1',
		component: 'equation',
		slots: {},
	},
	{ type: 'text', value: ' in ' },
	{
		type: 'component',
		id: 'container-1',
		component: 'container',
		slots: {
			header: [{ type: 'text', value: 'Result & explanation' }],
			children: [{
				type: 'plural',
				variable: 'count',
				branches: {
					one: [{ type: 'text', value: 'one step' }],
					other: [{ type: 'variable', name: 'count' }, { type: 'text', value: ' steps' }],
				},
				exactBranches: { '0': [{ type: 'text', value: 'no steps' }] },
				form: 'cardinal',
			}],
		},
	},
	{ type: 'text', value: '. ' },
	{
		type: 'select',
		variable: 'audience',
		branches: {
			student: [{ type: 'text', value: 'Try it.' }],
			other: [{ type: 'text', value: 'Inspect it.' }],
		},
	},
]

const target: Message = [
	{ type: 'text', value: 'Gebruik ' },
	{ type: 'component', id: 'equation-1', component: 'equation', slots: {} },
	{ type: 'text', value: ' in ' },
	{
		type: 'component',
		id: 'container-1',
		component: 'container',
		slots: {
			header: [{ type: 'text', value: 'Resultaat & uitleg' }],
			children: [{
				type: 'plural',
				variable: 'count',
				branches: {
					one: [{ type: 'text', value: 'één stap' }],
					other: [{ type: 'variable', name: 'count' }, { type: 'text', value: ' stappen' }],
				},
				exactBranches: { '0': [{ type: 'text', value: 'geen stappen' }] },
				form: 'cardinal',
			}],
		},
	},
	{ type: 'text', value: '. ' },
	{
		type: 'select',
		variable: 'audience',
		branches: {
			student: [{ type: 'text', value: 'Probeer het.' }],
			other: [{ type: 'text', value: 'Bekijk het.' }],
		},
	},
]

function createCatalog(): Catalog {
	return {
		sourceLocale: 'en',
		targetLocale: 'nl',
		units: [{
			id: 'problem',
			groupPath: ['exercise', 'step-1'],
			source,
			target: {
				message: target,
				reviewedSourceContentFingerprint: getMessageContentFingerprint(source),
				reviewedSourceStructureFingerprint: getMessageStructureFingerprint(source),
			},
		}],
	}
}

describe('XLIFF serialization', () => {
	it('round-trips catalogs containing every message construct', () => {
		const catalog = createCatalog()
		const xml = serializeXliff(catalog)

		expect(xml).toContain('version="2.1"')
		expect(xml).toContain('srcLang="en" trgLang="nl"')
		expect(xml).toContain('Result &amp; explanation')
		expect(parseXliff(xml)).toEqual(catalog)
	})

	it('round-trips source-only catalogs and copied components', () => {
		const catalog: Catalog = {
			sourceLocale: 'en',
			units: [{
				id: 'message',
				source: [
					{ type: 'component', id: 'strong-1', component: 'strong', slots: { children: [{ type: 'text', value: 'First' }] } },
					{ type: 'text', value: ' and ' },
					{ type: 'component', id: 'strong-2', component: 'strong', slots: { children: [{ type: 'text', value: 'second' }] }, copyOf: 'strong-1' },
				],
			}],
		}

		expect(parseXliff(serializeXliff(catalog))).toEqual(catalog)
	})
})

describe('XLIFF validation', () => {
	it.each([
		['malformed XML', '<xliff>'],
		['the wrong XLIFF version', '<xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0" srcLang="en"><file id="catalog"/></xliff>'],
		['a plural without an other branch', '<?xml version="1.0"?><xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" xmlns:swi18n="https://step-wise.com/ns/i18n" version="2.1" srcLang="en"><file id="catalog"><unit id="bad"><segment><source><pc id="x1" subType="swi18n:plural" swi18n:variable="count"><pc id="x2" subType="swi18n:plural-one">One</pc></pc></source></segment></unit></file></xliff>'],
	])('rejects %s', (_, xml) => {
		expect(() => parseXliff(xml)).toThrow(InvalidXliffError)
	})

	it('rejects targets in source-only catalogs', () => {
		const xml = serializeXliff(createCatalog()).replace(' trgLang="nl"', '')
		expect(() => parseXliff(xml)).toThrow(/Source-only catalogs cannot contain targets/)
	})

	it('rejects malformed reviewed-source fingerprints', () => {
		const xml = serializeXliff(createCatalog()).replace(/sourceContentFingerprint="[^"]+"/, 'sourceContentFingerprint="invalid"')
		expect(() => parseXliff(xml)).toThrow(/Fingerprints must contain 16 lowercase hexadecimal characters/)
	})

	it('rejects plural categories not used by the message locale', () => {
		const catalog = createCatalog()
		const unit = catalog.units[0]!
		const invalidTarget: Message = [{ type: 'plural', variable: 'count', branches: { zero: [], other: [] } }]
		expect(() => serializeXliff({
			...catalog,
			units: [{ ...unit, target: { ...unit.target!, message: invalidTarget } }],
		})).toThrow(/Plural category "zero" is not used by locale "nl"/)
	})
})

describe('catalog status', () => {
	it('classifies current, changed, structurally stale, and missing targets', () => {
		const [unit] = createCatalog().units
		const changedText: Message = [{ type: 'text', value: 'Apply ' }, ...source.slice(1)]
		expect(getCatalogUnitStatus(unit!)).toBe('current')
		expect(getCatalogUnitStatus({ ...unit!, source: changedText })).toBe('needs-review')
		expect(getCatalogUnitStatus({ ...unit!, source: [...source, { type: 'variable', name: 'extra' }] })).toBe('stale')
		expect(getCatalogUnitStatus({ ...unit!, target: undefined })).toBe('missing')
	})
})
