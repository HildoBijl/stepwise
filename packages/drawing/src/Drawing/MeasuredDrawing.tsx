import { type CSSProperties, type ForwardedRef, type ReactElement, type RefAttributes, forwardRef, useCallback, useLayoutEffect, useMemo, useState } from 'react'

import type { Rectangle } from '@step-wise/geometry'

import { useDrawingTargetBoundsMap } from '../positioning/index.ts'
import { type DrawingCoordinateSystem, type DrawingView, resolveDrawingView } from '../transforms/index.ts'

import { Drawing } from './Drawing.tsx'
import { useDrawingCoordinateSystem } from './context.ts'
import type { DrawingHandle, DrawingProps } from './types.ts'

export const defaultMeasuredDrawingView: DrawingView = { type: 'identity', width: 800, height: 600 }

export interface TargetBounds {
	readonly rectangle: Rectangle
	readonly left: number
	readonly right: number
	readonly top: number
	readonly bottom: number
	readonly width: number
	readonly height: number
}

export type TargetBoundsTuple<Targets extends readonly string[]> = {
	readonly [Index in keyof Targets]: TargetBounds
}

export type MeasuredDrawingProps<Targets extends readonly string[]> = Omit<DrawingProps, 'view'> & {
	initialView?: DrawingView
	targets: Targets
	calculateView: (...targetBounds: TargetBoundsTuple<Targets>) => DrawingView | undefined
	pendingVisibility?: 'hidden' | 'visible'
}

type MeasuredDrawingComponent = <const Targets extends readonly string[]>(
	props: MeasuredDrawingProps<Targets> & RefAttributes<DrawingHandle>,
) => ReactElement

export const MeasuredDrawing = forwardRef(MeasuredDrawingImplementation) as MeasuredDrawingComponent

function MeasuredDrawingImplementation<const Targets extends readonly string[]>(props: MeasuredDrawingProps<Targets>, ref: ForwardedRef<DrawingHandle>) {
	const { calculateView, targets, ...drawingProps } = props
	const calculateMeasuredView = useCallback((targetRectangles: TargetRectanglesTuple<Targets>) => {
		const targetBounds = targetRectangles.map(toTargetBounds) as TargetBoundsTuple<Targets>
		return calculateView(...targetBounds)
	}, [calculateView])
	return <MeasuredDrawingBase {...drawingProps} calculateView={calculateMeasuredView} ref={ref} targets={targets} />
}

type TargetRectanglesTuple<Targets extends readonly string[]> = {
	readonly [Index in keyof Targets]: Rectangle
}

export type MeasuredDrawingCalculation<Targets extends readonly string[]> = (
	targetBounds: TargetRectanglesTuple<Targets>,
	coordinateSystem: DrawingCoordinateSystem,
	initialCoordinateSystem: DrawingCoordinateSystem,
) => DrawingView | undefined

export type MeasuredDrawingBaseProps<Targets extends readonly string[]> = Omit<DrawingProps, 'view'> & {
	initialView?: DrawingView
	targets: Targets
	calculateView: MeasuredDrawingCalculation<Targets>
	pendingVisibility?: 'hidden' | 'visible'
}

export const MeasuredDrawingBase = forwardRef(MeasuredDrawingBaseImplementation) as <const Targets extends readonly string[]>(
	props: MeasuredDrawingBaseProps<Targets> & RefAttributes<DrawingHandle>,
) => ReactElement

function MeasuredDrawingBaseImplementation<const Targets extends readonly string[]>(props: MeasuredDrawingBaseProps<Targets>, ref: ForwardedRef<DrawingHandle>) {
	const { calculateView, children, initialView = defaultMeasuredDrawingView, pendingVisibility = 'hidden', style, targets, ...drawingProps } = props
	const [view, setView] = useState(initialView)
	const [ready, setReady] = useState(false)
	const initialCoordinateSystem = useMemo(() => resolveDrawingView(initialView), [initialView])
	const resolveView = useCallback((nextView: DrawingView) => {
		setView(currentView => areDrawingViewsEquivalent(currentView, nextView) ? currentView : nextView)
		setReady(true)
	}, [])
	const resolvedStyle: CSSProperties | undefined = !ready && pendingVisibility === 'hidden' ? { ...style, visibility: 'hidden' } : style

	return <Drawing {...drawingProps} ref={ref} style={resolvedStyle} view={view}>
		<MeasuredViewController calculateView={calculateView} initialCoordinateSystem={initialCoordinateSystem} onResolve={resolveView} targets={targets} />
		{children}
	</Drawing>
}

function MeasuredViewController<const Targets extends readonly string[]>({ calculateView, initialCoordinateSystem, onResolve, targets }: {
	calculateView: MeasuredDrawingCalculation<Targets>
	initialCoordinateSystem: DrawingCoordinateSystem
	onResolve: (view: DrawingView) => void
	targets: Targets
}) {
	const coordinateSystem = useDrawingCoordinateSystem()
	const measuredBounds = useDrawingTargetBoundsMap(targets)

	useLayoutEffect(() => {
		const targetBounds: Rectangle[] = []
		for (const target of targets) {
			const bounds = measuredBounds.get(target)
			if (!bounds) return
			targetBounds.push(bounds)
		}
		const view = calculateView(targetBounds as TargetRectanglesTuple<Targets>, coordinateSystem, initialCoordinateSystem)
		if (view) onResolve(view)
	}, [calculateView, coordinateSystem, initialCoordinateSystem, measuredBounds, onResolve, targets])

	return null
}

function toTargetBounds(rectangle: Rectangle): TargetBounds {
	return {
		rectangle,
		left: rectangle.min.x,
		right: rectangle.max.x,
		top: rectangle.min.y,
		bottom: rectangle.max.y,
		width: rectangle.width,
		height: rectangle.height,
	}
}

function areDrawingViewsEquivalent(first: DrawingView, second: DrawingView): boolean {
	const firstCoordinates = resolveDrawingView(first)
	const secondCoordinates = resolveDrawingView(second)
	return firstCoordinates.width === secondCoordinates.width &&
		firstCoordinates.height === secondCoordinates.height &&
		firstCoordinates.yDirection === secondCoordinates.yDirection &&
		firstCoordinates.drawingToPixelTransformation.equals(secondCoordinates.drawingToPixelTransformation)
}
