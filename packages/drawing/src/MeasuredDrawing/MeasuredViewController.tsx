import { useCallback, useLayoutEffect, useState } from 'react'

import { useDrawingCoordinateSystem } from '../Drawing/context.ts'
import { useDrawingTargetBoundsMap } from '../positioning/index.ts'
import { type DrawingCoordinateSystem, type DrawingView, resolveDrawingView } from '../transforms/index.ts'

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
	const measuredBounds = useDrawingTargetBoundsMap(targets)

	// On every update, check if the bounds are known. If so, try to resolve the view out of them.
	useLayoutEffect(() => {
		const targetRectangles = resolveTargetRectanglesRecord(targets, measuredBounds)
		if (!targetRectangles) return
		const view = calculateView(toTargetBoundsRecord(targetRectangles, coordinateSystem), coordinateSystem)
		if (view) onResolve(view)
	}, [calculateView, coordinateSystem, measuredBounds, onResolve, targets])

	// Don't render anything.
	return null
}

function areDrawingViewsEquivalent(first: DrawingView, second: DrawingView): boolean {
	const firstCoordinates = resolveDrawingView(first)
	const secondCoordinates = resolveDrawingView(second)
	return firstCoordinates.width === secondCoordinates.width && firstCoordinates.height === secondCoordinates.height && firstCoordinates.yDirection === secondCoordinates.yDirection && firstCoordinates.drawingToPixelTransformation.equals(secondCoordinates.drawingToPixelTransformation)
}
