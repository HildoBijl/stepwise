import { describe, expect, it } from 'vitest'

import { createFieldRegistry, type FormFieldDefinition } from '../fields/index.ts'
import { createInputManager } from './inputManager.ts'

type TestInputValue = { type: 'Test', value: string }
type TestInputState = { value: string, cursor?: number }

class TestVector {
	constructor(readonly x: number, readonly y: number) {}
}

const normalizeInput = (state: TestInputState): TestInputValue => ({ type: 'Test', value: state.value })
const hydrateInput = (value: TestInputValue): TestInputState => ({ value: value.value })

function createSetup(initialInputValues = {}, definitionOptions: Partial<FormFieldDefinition<TestInputState, TestInputValue>> = {}) {
	const registry = createFieldRegistry()
	registry.registerField('answer', {
		defaultInputValue: { type: 'Test', value: 'default' },
		normalizeInput,
		hydrateInput,
		...definitionOptions,
	})
	return { registry, input: createInputManager({ registry, initialInputValues }) }
}

describe('input manager', () => {
	it('hydrates form-level and field-level initial values', () => {
		const withFormInitial = createSetup({ answer: { type: 'Test', value: 'stored' } }).input
		expect(withFormInitial.getFieldInputState('answer')).toEqual({ value: 'stored' })
		expect(withFormInitial.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'stored' })

		const withFieldInitial = createSetup().input
		expect(withFieldInitial.getFieldInputState('answer')).toEqual({ value: 'default' })
	})

	it('normalizes InputState updates and preserves equal InputValue references', () => {
		const { input } = createSetup()
		const previousInputValue = input.getFieldInputValue('answer')
		const cursorUpdate = input.setFieldInputState('answer', { value: 'default', cursor: 3 })

		expect(cursorUpdate).toEqual({ fieldId: 'answer', inputStateChanged: true, inputValueChanged: false })
		expect(input.getFieldInputValue('answer')).toBe(previousInputValue)

		const valueUpdate = input.setFieldInputState('answer', state => ({ ...(state as TestInputState), value: 'changed' }))
		expect(valueUpdate.inputValueChanged).toBe(true)
		expect(input.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'changed' })
	})

	it('uses identity for InputState changes so states may contain class instances', () => {
		const { input } = createSetup()
		const nextInputState = { value: 'default', vector: new TestVector(1, 2) }

		expect(input.setFieldInputState('answer', nextInputState)).toEqual({
			fieldId: 'answer',
			inputStateChanged: true,
			inputValueChanged: false,
		})
		expect(input.getFieldInputState('answer')).toBe(nextInputState)
	})

	it('preserves InputState when an externally supplied InputValue is unchanged', () => {
		const { input } = createSetup()
		input.setFieldInputState('answer', { value: 'default', cursor: 3 })

		expect(input.setFieldInputValue('answer', { type: 'Test', value: 'default' })).toEqual({
			fieldId: 'answer',
			inputStateChanged: false,
			inputValueChanged: false,
		})
		expect(input.getFieldInputState('answer')).toEqual({ value: 'default', cursor: 3 })
	})

	it('uses field-specific InputValue equality', () => {
		const { input } = createSetup({}, {
			areInputValuesEqual: (first, second) => first.value.trim() === second.value.trim(),
		})
		const previousInputValue = input.getFieldInputValue('answer')

		const update = input.setFieldInputState('answer', { value: ' default ' })
		expect(update.inputValueChanged).toBe(false)
		expect(input.getFieldInputValue('answer')).toBe(previousInputValue)
	})

	it('hydrates externally supplied InputValues', () => {
		const { input } = createSetup()
		const update = input.setFieldInputValue('answer', { type: 'Test', value: 'inserted' })

		expect(update).toEqual({ fieldId: 'answer', inputStateChanged: true, inputValueChanged: true })
		expect(input.getFieldInputState('answer')).toEqual({ value: 'inserted' })
	})

	it('patches supplied fields and replaces omitted fields with their defaults', () => {
		const { registry, input } = createSetup()
		registry.registerField('second', {
			defaultInputValue: { type: 'Test', value: 'second-default' },
			normalizeInput,
			hydrateInput,
		})
		input.initializeField('second')

		input.patchInputValues({ answer: { type: 'Test', value: 'patched' } })
		expect(input.getInputValues()).toEqual({
			answer: { type: 'Test', value: 'patched' },
			second: { type: 'Test', value: 'second-default' },
		})

		input.setInputValues({ second: { type: 'Test', value: 'replaced' } })
		expect(input.getInputValues()).toEqual({
			answer: { type: 'Test', value: 'default' },
			second: { type: 'Test', value: 'replaced' },
		})
	})

	it('reports bulk InputValue changes against the previous normalized values', () => {
		const { input } = createSetup()
		input.initializeField('answer')

		expect(input.patchInputValues({ answer: { type: 'Test', value: 'default' } })).toEqual([
			{ fieldId: 'answer', inputStateChanged: false, inputValueChanged: false },
		])
		expect(input.patchInputValues({ answer: { type: 'Test', value: 'changed' } })).toEqual([
			{ fieldId: 'answer', inputStateChanged: true, inputValueChanged: true },
		])
	})

	it('resets to existing or replacement initial values', () => {
		const { input } = createSetup({ answer: { type: 'Test', value: 'initial' } })
		input.setFieldInputValue('answer', { type: 'Test', value: 'edited' })
		input.resetInputValues()
		expect(input.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'initial' })

		input.resetInputValues({ answer: { type: 'Test', value: 'replacement' } })
		expect(input.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'replacement' })
	})

	it('applies changed initial values according to the selected policy', () => {
		const untouched = createSetup({ answer: { type: 'Test', value: 'first' } }).input
		untouched.updateInitialInputValues({ answer: { type: 'Test', value: 'second' } })
		expect(untouched.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'second' })

		const edited = createSetup({ answer: { type: 'Test', value: 'first' } }).input
		edited.setFieldInputValue('answer', { type: 'Test', value: 'edited' })
		edited.updateInitialInputValues({ answer: { type: 'Test', value: 'second' } }, 'untouched')
		expect(edited.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'edited' })
		edited.updateInitialInputValues({ answer: { type: 'Test', value: 'forced' } }, 'always')
		expect(edited.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'forced' })

		const ignored = createSetup({ answer: { type: 'Test', value: 'first' } }).input
		ignored.updateInitialInputValues({ answer: { type: 'Test', value: 'ignored' } }, 'never')
		expect(ignored.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'first' })
	})

	it('stores initial values for fields that register later', () => {
		const registry = createFieldRegistry()
		const input = createInputManager({ registry, initialInputValues: { future: { type: 'Test', value: 'stored' } } })
		registry.registerField('future', {
			defaultInputValue: { type: 'Test', value: 'default' },
			normalizeInput,
			hydrateInput,
		})

		expect(input.getFieldInputState('future')).toEqual({ value: 'stored' })
	})

	it('stores patched values for fields that register later', () => {
		const registry = createFieldRegistry()
		const input = createInputManager({ registry })
		input.patchInputValues({ future: { type: 'Test', value: 'patched' } })
		registry.registerField('future', {
			defaultInputValue: { type: 'Test', value: 'default' },
			normalizeInput,
			hydrateInput,
		})

		expect(input.getFieldInputState('future')).toEqual({ value: 'patched' })
	})

	it('removes current field input while retaining its initial baseline', () => {
		const { input } = createSetup({ answer: { type: 'Test', value: 'initial' } })
		input.setFieldInputValue('answer', { type: 'Test', value: 'edited' })
		input.removeFieldInput('answer')

		expect(input.getFieldInputValue('answer')).toEqual({ type: 'Test', value: 'initial' })
	})

	it('rejects access to fields unknown to the registry', () => {
		const registry = createFieldRegistry()
		const input = createInputManager({ registry })
		expect(() => input.getFieldInputValue('missing')).toThrow('is not registered')
	})
})
