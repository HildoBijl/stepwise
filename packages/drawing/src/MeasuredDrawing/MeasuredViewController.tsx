import { useCallback, useLayoutEffect, useState } from 'react'

import { numbersEqual } from '@step-wise/js-utils'
import { useStableValue } from '@step-wise/react-utils'

import { useDrawingCoordinateSystem } from '../Drawing/context.ts'
import { useDrawingTargetRenderBoundsMap } from '../DrawingTargets/renderBoundsHooks.ts'
import { type DrawingCoordinateSystem, type DrawingView, resolveDrawingView } from '../transforms/index.ts'
import { drawingMeasurementToleranceInPixels, drawingMeasurementEqualityOptions } from '../transforms/measurementTolerance.ts'

import { type TargetBoundsRecord, resolveTargetRectanglesRecord, toTargetBoundsRecord } from './targetBounds.ts'

export type MeasuredDrawingCalculation<Targets extends readonly string[]> = (
	targetBounds: TargetBoundsRecord<Targets>,
	coordinateSystem: DrawingCoordinateSystem,
) => DrawingView | undefined

// A state that tracks if the view for the drawing has been able to resolve yet, returning either the resolved view (when available) or the initial view.
export function useMeasuredDrawingState(initialView: DrawingView) {
	const [view, setView] = useState(initialView)
	const [ready, setReady] = useState(false)
	const resolveView = useCallback((nextView: DrawingView) => {
		setView(currentView => areDrawingViewsEquivalent(currentView, nextView) ? currentView : nextView)
		setReady(true)
	}, [])
	return { ready, resolveView, view }
}

// A Drawing-internal component that tracks its context to see if the view can be calculated. If so, it resolves it.
export function MeasuredViewController<const Targets extends readonly string[]>({ calculateView, onResolve, targets }: {
	calculateView: MeasuredDrawingCalculation<Targets>
	onResolve: (view: DrawingView) => void
	targets: Targets
}) {
	// Obtain the relevant bounds info.
	const coordinateSystem = useDrawingCoordinateSystem()
	const stableTargets = useStableValue(targets, areTargetArraysEqual)
	const measuredBounds = useDrawingTargetRenderBoundsMap(stableTargets, { allowStale: false, coordinateSystem })

	// On every update, check if the bounds are known. If so, try to resolve the view out of them.
	useLayoutEffect(() => {
		const targetRectangles = resolveTargetRectanglesRecord(stableTargets, measuredBounds)
		if (!targetRectangles) return
		const view = calculateView(toTargetBoundsRecord(targetRectangles, coordinateSystem), coordinateSystem)
		if (view) onResolve(view)
	}, [calculateView, coordinateSystem, measuredBounds, onResolve, stableTargets])

	// Don't render anything.
	return null
}

function areTargetArraysEqual(current: readonly string[], previous: readonly string[]): boolean {
	return current.length === previous.length && current.every((target, index) => target === previous[index])
}

function areDrawingViewsEquivalent(first: DrawingView, second: DrawingView): boolean {
	const firstCoordinates = resolveDrawingView(first)
	const secondCoordinates = resolveDrawingView(second)
	if (!numbersEqual(firstCoordinates.width, secondCoordinates.width, drawingMeasurementEqualityOptions) || !numbersEqual(firstCoordinates.height, secondCoordinates.height, drawingMeasurementEqualityOptions)) return false
	if (firstCoordinates.yDirection !== secondCoordinates.yDirection) return false

	// Compare the visual effect of both transformations throughout the viewport. Sampling only drawing-coordinate unit vectors can hide a tiny scale difference that accumulates into a visible shift farther from the origin.
	const viewportCorners = [[0, 0], [firstCoordinates.width, 0], [0, firstCoordinates.height], [firstCoordinates.width, firstCoordinates.height]]
	return viewportCorners.every(pixelPosition => {
		const drawingPosition = firstCoordinates.pixelToDrawing(pixelPosition)
		return firstCoordinates.drawingToPixel(drawingPosition).distanceTo(secondCoordinates.drawingToPixel(drawingPosition)) <= drawingMeasurementToleranceInPixels
	})
}
