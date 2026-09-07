// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import './testSetup.ts'
import { useHasMounted, useIsMountedRef } from './lifecycle.ts'

describe('lifecycle hooks', () => {
	it('tracks whether the component is mounted through a ref', () => {
		const { result, unmount } = renderHook(() => useIsMountedRef())
		const mountedRef = result.current
		expect(mountedRef.current).toBe(true)
		act(() => unmount())
		expect(mountedRef.current).toBe(false)
	})

	it('reports when the component has mounted', () => {
		const { result } = renderHook(() => useHasMounted())
		expect(result.current).toBe(true)
	})
})
