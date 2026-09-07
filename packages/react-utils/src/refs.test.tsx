// @vitest-environment jsdom

import { type Ref, createRef, forwardRef } from 'react'
import { act, render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import './testSetup.ts'
import { useAssertConstant, useConstant, useForwardedRef, useLastDefinedValue, useLatestRef, usePrevious, useReferencePreservingValue, useStableCallback, useStableValue } from './refs.ts'

describe('value refs', () => {
	it('creates constant values only once and detects changes to asserted constants', () => {
		const factory = vi.fn(() => ({}))
		const constant = renderHook(() => useConstant(factory))
		constant.rerender()
		expect(factory).toHaveBeenCalledOnce()

		const asserted = renderHook(({ value }) => useAssertConstant(value), { initialProps: { value: 1 } })
		expect(() => asserted.rerender({ value: 2 })).toThrow('expected the value to remain constant')
	})

	it('preserves a latest-value ref while updating its contents', () => {
		const { result, rerender } = renderHook(({ value }) => useLatestRef(value), { initialProps: { value: 1 } })
		const ref = result.current
		rerender({ value: 2 })
		expect(result.current).toBe(ref)
		expect(ref.current).toBe(2)
	})

	it('tracks previous and last-defined values', () => {
		const previous = renderHook(({ value }) => usePrevious(value, 0), { initialProps: { value: 1 } })
		expect(previous.result.current).toBe(0)
		previous.rerender({ value: 2 })
		expect(previous.result.current).toBe(1)

		const lastDefined = renderHook(({ value }: { value: number | undefined }) => useLastDefinedValue(value), { initialProps: { value: 1 as number | undefined } })
		lastDefined.rerender({ value: undefined })
		expect(lastDefined.result.current).toBe(1)
	})
})

describe('reference preservation', () => {
	it('preserves structurally reusable references', () => {
		const first = { nested: { value: 1 } }
		const { result, rerender } = renderHook(({ value }) => useReferencePreservingValue(value), { initialProps: { value: first } })
		rerender({ value: { nested: { value: 1 } } })
		expect(result.current).toBe(first)
	})

	it('uses the provided equality function for stable values', () => {
		const first = { value: 1 }
		const { result, rerender } = renderHook(({ value }) => useStableValue(value, (current, previous) => current.value === previous.value), { initialProps: { value: first } })
		rerender({ value: { value: 1 } })
		expect(result.current).toBe(first)
		rerender({ value: { value: 2 } })
		expect(result.current.value).toBe(2)
	})

	it('keeps a callback stable while invoking its latest implementation', () => {
		const first = vi.fn()
		const second = vi.fn()
		const { result, rerender } = renderHook(({ callback }) => useStableCallback(callback), { initialProps: { callback: first } })
		const stableCallback = result.current
		rerender({ callback: second })
		result.current('value')
		expect(result.current).toBe(stableCallback)
		expect(first).not.toHaveBeenCalled()
		expect(second).toHaveBeenCalledWith('value')
	})
})

it('connects an internal element ref to a forwarded ref', () => {
	const Component = forwardRef<HTMLDivElement>((_, forwardedRef) => {
		const ref = useForwardedRef(forwardedRef as Ref<HTMLDivElement>)
		return <div ref={ref} />
	})
	const forwardedRef = createRef<HTMLDivElement>()
	const { container } = render(<Component ref={forwardedRef} />)
	expect(forwardedRef.current).toBe(container.firstElementChild)
})
