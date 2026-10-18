import { describe, expect, it } from 'vitest'

import {
	compareSourceMessages,
	getMessageContentFingerprint,
	getMessageStructureFingerprint,
	normalizeMessage,
	type Message,
	validateMessage,
} from './index.ts'

describe('message normalization', () => {
	it('merges adjacent text and orders named slots', () => {
		const message: Message = [
			{ type: 'text', value: 'Hello' },
			{ type: 'text', value: ' world' },
			{
				type: 'component',
				id: 'c1',
				component: 'container',
				slots: {
					children: [{ type: 'text', value: 'Contents' }],
					header: [{ type: 'text', value: 'Title' }],
				},
			},
		]

		expect(normalizeMessage(message)).toEqual([
			{ type: 'text', value: 'Hello world' },
			{
				type: 'component',
				id: 'c1',
				component: 'container',
				slots: {
					children: [{ type: 'text', value: 'Contents' }],
					header: [{ type: 'text', value: 'Title' }],
				},
			},
		])
	})
})

describe('message validation', () => {
	it('reports duplicate component IDs and missing plural fallbacks', () => {
		const message = [
			{ type: 'component', id: 'c1', component: 'strong', slots: {} },
			{ type: 'component', id: 'c1', component: 'equation', slots: {} },
			{ type: 'plural', variable: 'count', branches: { one: [] } },
		] as unknown as Message

		expect(validateMessage(message).map(issue => issue.message)).toEqual([
			'Duplicate component ID "c1".',
			'Plural messages must define an other branch.',
		])
	})

	it('rejects ambiguous exact plural keys', () => {
		const message: Message = [{
			type: 'plural',
			variable: 'count',
			branches: { other: [] },
			exactBranches: { '1.0': [{ type: 'text', value: 'Exactly one' }] },
		}]

		expect(validateMessage(message).map(issue => issue.message)).toEqual([
			'Exact plural keys must be canonical finite numbers.',
		])
	})

	it('accepts components with arbitrary translated slots and complete plurals', () => {
		const message: Message = [{
			type: 'component',
			id: 'c1',
			component: 'container',
			slots: {
				header: [{ type: 'text', value: 'Balls' }],
				children: [{
					type: 'plural',
					variable: 'count',
					branches: {
						one: [{ type: 'text', value: 'One ball' }],
						other: [{ type: 'variable', name: 'count' }, { type: 'text', value: ' balls' }],
					},
				}],
			},
		}]

		expect(validateMessage(message)).toEqual([])
	})
})

describe('message compatibility', () => {
	const original: Message = [{
		type: 'component',
		id: 'c1',
		component: 'strong',
		slots: { children: [{ type: 'text', value: 'important' }] },
	}]

	it('does not treat regenerated occurrence IDs as source changes', () => {
		const regenerated: Message = [{ ...original[0]!, id: 'c9' } as typeof original[number]]
		expect(compareSourceMessages(original, regenerated)).toBe('current')
	})

	it('marks text-only changes as needing review', () => {
		const changed: Message = [{
			...original[0]!,
			slots: { children: [{ type: 'text', value: 'very important' }] },
		} as typeof original[number]]

		expect(compareSourceMessages(original, changed)).toBe('needs-review')
		expect(getMessageStructureFingerprint(original)).toBe(getMessageStructureFingerprint(changed))
		expect(getMessageContentFingerprint(original)).not.toBe(getMessageContentFingerprint(changed))
	})

	it('marks component and slot changes as stale', () => {
		const changed: Message = [{
			...original[0]!,
			slots: {
				children: [{ type: 'text', value: 'important' }],
				label: [{ type: 'text', value: 'Notice' }],
			},
		} as typeof original[number]]

		expect(compareSourceMessages(original, changed)).toBe('stale')
	})

})
