// @vitest-environment jsdom

import type { PropsWithChildren } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createFormStore } from '../store/index.ts'

import { FormProvider, useFormStore } from './context.tsx'
import { useFormSnapshot } from './useFormSnapshot.ts'

function createStore() {
	return createFormStore({
		interpretInput: inputValues => inputValues,
		onSubmit: () => undefined,
	})
}

describe('form context', () => {
	it('rejects hooks used outside a FormProvider', () => {
		expect(() => renderHook(() => useFormStore())).toThrow('within a FormProvider')
	})

	it('provides the store and its stable snapshot', () => {
		const store = createStore()
		const wrapper = ({ children }: PropsWithChildren) => <FormProvider store={store}>{children}</FormProvider>
		const { result } = renderHook(() => ({ store: useFormStore(), snapshot: useFormSnapshot() }), { wrapper })

		expect(result.current.store).toBe(store)
		expect(result.current.snapshot).toBe(store.getSnapshot())
	})
})
