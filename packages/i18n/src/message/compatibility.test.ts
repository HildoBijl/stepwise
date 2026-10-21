import { describe, expect, it } from 'vitest'

import { type Message } from './types.ts'
import { validateMessageCompatibility } from './compatibility.ts'

describe('message compatibility', () => {
	it('allows component reordering and generic component copies', () => {
		const source: Message = [
			{ type: 'component', id: 'equation-1', component: 'equation', slots: {} },
			{ type: 'component', id: 'strong-1', component: 'strong', slots: { children: [{ type: 'text', value: 'important' }] } },
		]
		const target: Message = [
			{ type: 'component', id: 'strong-1', component: 'strong', slots: { children: [{ type: 'text', value: 'belangrijk' }] } },
			{ type: 'component', id: 'strong-2', copyOf: 'strong-1', component: 'strong', slots: { children: [{ type: 'text', value: 'erg' }] } },
			{ type: 'component', id: 'equation-1', component: 'equation', slots: {} },
		]
		expect(validateMessageCompatibility(source, target)).toEqual([])
	})

	it('reports unknown components, changed types and changed slots', () => {
		const source: Message = [{ type: 'component', id: 'field-1', component: 'input-field', slots: { label: [{ type: 'text', value: 'Answer' }] } }]
		const target: Message = [
			{ type: 'component', id: 'unknown', component: 'input-field', slots: { label: [] } },
			{ type: 'component', id: 'field-1', component: 'button', slots: { children: [] } },
		]
		const issues = validateMessageCompatibility(source, target)
		expect(issues.map(issue => issue.message)).toEqual([
			'Component references unknown source occurrence "unknown".',
			'Expected component "input-field", received "button".',
			'Component "field-1" must retain its translated slots: label.',
		])
	})

	it('requires the same variables while allowing their order and repetition to change', () => {
		const source: Message = [{ type: 'variable', name: 'first' }, { type: 'variable', name: 'second' }]
		const target: Message = [{ type: 'variable', name: 'second' }, { type: 'variable', name: 'unknown' }, { type: 'variable', name: 'second' }]
		expect(validateMessageCompatibility(source, target).map(issue => issue.message)).toEqual([
			'Translation references unknown variable "unknown".',
			'Translation omits source variable "first".',
		])
	})

	it('allows locale-specific plural categories but retains constructs and exact branches', () => {
		const source: Message = [{ type: 'plural', variable: 'count', branches: { one: [], other: [] }, exactBranches: { '0': [] } }]
		const target: Message = [{ type: 'plural', variable: 'count', branches: { one: [], few: [], other: [] }, exactBranches: { '0': [] } }]
		expect(validateMessageCompatibility(source, target)).toEqual([])

		const changedTarget: Message = [{ type: 'plural', variable: 'count', branches: { other: [] }, exactBranches: { '2': [] } }]
		expect(validateMessageCompatibility(source, changedTarget).some(issue => issue.message.includes('unknown or changed plural'))).toBe(true)
	})

	it('requires select values while allowing branch order to change', () => {
		const source: Message = [{ type: 'select', variable: 'role', branches: { teacher: [], student: [], other: [] } }]
		const target: Message = [{ type: 'select', variable: 'role', branches: { other: [], student: [], teacher: [] } }]
		expect(validateMessageCompatibility(source, target)).toEqual([])

		const changedTarget: Message = [{ type: 'select', variable: 'role', branches: { teacher: [], other: [] } }]
		expect(validateMessageCompatibility(source, changedTarget).some(issue => issue.message.includes('unknown or changed select'))).toBe(true)
	})
})
