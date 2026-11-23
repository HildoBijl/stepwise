import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FormFieldDefinition } from '../fields/index.ts'

import { Form } from './Form.tsx'
import { useFormField } from './useFormField.ts'

type TestInputValue = { type: 'Test', value: string }
type TestInputState = { value: string }
type InputValues = { answer: TestInputValue }
type DomainValues = { answer: number }

const definition: FormFieldDefinition<TestInputState, TestInputValue, number, InputValues, DomainValues> = {
	defaultInputValue: { type: 'Test', value: '' },
	normalizeInput: state => ({ type: 'Test', value: state.value }),
	hydrateInput: value => ({ value: value.value }),
}

function AnswerField() {
	const field = useFormField('answer', definition)
	return <input aria-label="Answer" value={field.inputState.value} onChange={event => field.setInputState({ value: event.target.value })} />
}

const interpretInput = (inputValues: InputValues): DomainValues => ({ answer: Number(inputValues.answer.value) })

afterEach(cleanup)

describe('Form', () => {
	it('creates its store and validates before native form submission', async () => {
		const onSubmit = vi.fn()
		render(
			<Form<InputValues, DomainValues>
				initialInputValues={{ answer: { type: 'Test', value: '2' } }}
				interpretInput={interpretInput}
				onSubmit={onSubmit}
			>
				<AnswerField />
				<button type="submit">Submit</button>
			</Form>,
		)

		fireEvent.change(screen.getByLabelText('Answer'), { target: { value: '3' } })
		fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
			inputValues: { answer: { type: 'Test', value: '3' } },
			domainValues: { answer: 3 },
		})))
	})

	it('applies changed initial values according to the selected policy', () => {
		const onSubmit = vi.fn()
		const { rerender } = render(
			<Form<InputValues, DomainValues>
				initialInputValues={{ answer: { type: 'Test', value: '1' } }}
				interpretInput={interpretInput}
				onSubmit={onSubmit}
			>
				<AnswerField />
			</Form>,
		)
		const input = screen.getByLabelText('Answer')

		rerender(
			<Form<InputValues, DomainValues>
				initialInputValues={{ answer: { type: 'Test', value: '2' } }}
				interpretInput={interpretInput}
				onSubmit={onSubmit}
			>
				<AnswerField />
			</Form>,
		)
		expect((input as HTMLInputElement).value).toBe('2')

		fireEvent.change(input, { target: { value: 'edited' } })
		rerender(
			<Form<InputValues, DomainValues>
				initialInputValues={{ answer: { type: 'Test', value: '3' } }}
				interpretInput={interpretInput}
				onSubmit={onSubmit}
			>
				<AnswerField />
			</Form>,
		)
		expect((input as HTMLInputElement).value).toBe('edited')
	})

	it('uses the latest submission callback without recreating the store', async () => {
		const firstSubmit = vi.fn()
		const secondSubmit = vi.fn()
		const { rerender } = render(
			<Form<InputValues, DomainValues> interpretInput={interpretInput} onSubmit={firstSubmit}>
				<AnswerField />
				<button type="submit">Submit</button>
			</Form>,
		)

		rerender(
			<Form<InputValues, DomainValues> interpretInput={interpretInput} onSubmit={secondSubmit}>
				<AnswerField />
				<button type="submit">Submit</button>
			</Form>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

		await waitFor(() => expect(secondSubmit).toHaveBeenCalledOnce())
		expect(firstSubmit).not.toHaveBeenCalled()
	})
})
