// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { Transformation } from '@step-wise/geometry'

import type { DrawingView } from '../transforms/index.ts'

import { useMeasuredDrawingState } from './MeasuredViewController.tsx'

describe('useMeasuredDrawingState', () => {
	test('keeps a stable view for visually equivalent subpixel changes', () => {
		const initialView: DrawingView = { type: 'custom', width: 100, height: 100, drawingToPixelTransformation: Transformation.fromUniformScale(1, 2) }
		const equivalentView: DrawingView = { type: 'custom', width: 100.05, height: 100.05, drawingToPixelTransformation: Transformation.fromUniformScale(1.0005, 2) }
		const { result } = renderHook(() => useMeasuredDrawingState(initialView))

		act(() => { result.current.resolveView(equivalentView) })

		expect(result.current.view).toBe(initialView)
		expect(result.current.ready).toBe(true)
	})

	test('updates when a small scale difference accumulates across the viewport', () => {
		const initialView: DrawingView = { type: 'custom', width: 100, height: 100, drawingToPixelTransformation: Transformation.fromUniformScale(1, 2) }
		const visiblyDifferentView: DrawingView = { type: 'custom', width: 100, height: 100, drawingToPixelTransformation: Transformation.fromUniformScale(1.002, 2) }
		const { result } = renderHook(() => useMeasuredDrawingState(initialView))

		act(() => { result.current.resolveView(visiblyDifferentView) })

		expect(result.current.view).toBe(visiblyDifferentView)
	})
})
