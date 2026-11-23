import { describe, expect, it } from 'vitest'

import type { FormFieldDefinition } from './types.ts'
import { createFieldRegistry } from './fieldRegistry.ts'

type TestInputValue = { type: 'Test', value: string }
type TestInputState = { value: string, cursor?: number }

const normalizeInput = (state: TestInputState): TestInputValue => ({ type: 'Test', value: state.value })
const hydrateInput = (value: TestInputValue): TestInputState => ({ value: value.value })

function createDefinition(options: Partial<FormFieldDefinition<TestInputState, TestInputValue>> = {}): FormFieldDefinition<TestInputState, TestInputValue> {
	return {
		initialInputValue: { type: 'Test', value: '' },
		normalizeInput,
		hydrateInput,
		...options,
	}
}

describe('field registry', () => {
	it('registers and unregisters fields', () => {
		const registry = createFieldRegistry()
		const unregister = registry.registerField('answer', createDefinition())

		expect(registry.getFieldIds()).toEqual(['answer'])
		expect(registry.getField('answer')).toMatchObject({ fieldId: 'answer', registrationCount: 1 })

		unregister()
		expect(registry.getField('answer')).toBeUndefined()
	})

	it('tracks multiple registrations of the same field and section', () => {
		const registry = createFieldRegistry()
		const definition = createDefinition()
		const unregisterFirst = registry.registerField('answer', definition, 'step-1')
		const unregisterSecond = registry.registerField('answer', createDefinition(), 'step-1')

		expect(registry.getField('answer')).toMatchObject({ registrationCount: 2 })
		expect(registry.getField('answer')?.sectionRegistrationCounts.get('step-1')).toBe(2)
		expect(registry.getSectionFieldIds('step-1')).toEqual(['answer'])

		unregisterFirst()
		expect(registry.getField('answer')).toMatchObject({ registrationCount: 1 })
		expect(registry.getField('answer')?.sectionRegistrationCounts.get('step-1')).toBe(1)

		unregisterSecond()
		expect(registry.getField('answer')).toBeUndefined()
	})

	it('tracks a field in every section where it is mounted', () => {
		const registry = createFieldRegistry()
		const definition = createDefinition()
		const unregisterFirst = registry.registerField('answer', definition, 'main')
		const unregisterSecond = registry.registerField('answer', definition, 'step-1')

		expect(registry.getSectionFieldIds('main')).toEqual(['answer'])
		expect(registry.getSectionFieldIds('step-1')).toEqual(['answer'])

		unregisterFirst()
		expect(registry.getSectionFieldIds('main')).toEqual([])
		expect(registry.getSectionFieldIds('step-1')).toEqual(['answer'])
		unregisterSecond()
	})

	it('retains inactive fields when requested', () => {
		const registry = createFieldRegistry()
		const unregister = registry.registerField('answer', createDefinition({ retainOnUnmount: true }), 'step-1')
		unregister()

		expect(registry.getFieldIds()).toEqual([])
		expect(registry.getFieldIds({ includeInactive: true })).toEqual(['answer'])
		expect(registry.getField('answer')).toMatchObject({ registrationCount: 0 })
		expect(registry.getSectionFieldIds('step-1')).toEqual([])
	})

	it('rejects conflicting definitions for one field ID', () => {
		const registry = createFieldRegistry()
		registry.registerField('answer', createDefinition())

		expect(() => registry.registerField('answer', createDefinition({ normalizeInput: state => ({ type: 'Test', value: state.value.trim() }) })))
			.toThrow('definition differs')
	})

	it('returns snapshots that cannot mutate registry section counts', () => {
		const registry = createFieldRegistry()
		registry.registerField('answer', createDefinition(), 'main')
		const snapshot = registry.getField('answer')!

		;(snapshot.sectionRegistrationCounts as Map<string, number>).clear()
		expect(registry.getSectionFieldIds('main')).toEqual(['answer'])
	})

	it('ignores repeated cleanup calls and rejects empty field IDs', () => {
		const registry = createFieldRegistry()
		const unregister = registry.registerField('answer', createDefinition())
		unregister()
		unregister()

		expect(registry.getFieldIds()).toEqual([])
		expect(() => registry.registerField('', createDefinition())).toThrow('non-empty string')
	})
})
