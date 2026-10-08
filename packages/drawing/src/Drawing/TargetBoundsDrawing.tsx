import { type ForwardedRef, type ReactElement, type RefAttributes, forwardRef, useCallback } from 'react'

import type { Margin } from '../transforms/index.ts'

import { type MeasuredDrawingBaseProps, MeasuredDrawingBase } from './MeasuredDrawing.tsx'
import { getInitialViewBounds, getViewAroundTargetBounds } from './targetBoundsView.ts'
import type { DrawingHandle } from './types.ts'

export type TargetBoundsDrawingProps<Targets extends readonly string[]> = Omit<MeasuredDrawingBaseProps<Targets>, 'calculateView'> & {
	margin?: Margin
	includeInitialView?: boolean
}

type TargetBoundsDrawingComponent = <const Targets extends readonly string[]>(
	props: TargetBoundsDrawingProps<Targets> & RefAttributes<DrawingHandle>,
) => ReactElement

export const TargetBoundsDrawing = forwardRef(TargetBoundsDrawingImplementation) as TargetBoundsDrawingComponent

function TargetBoundsDrawingImplementation<const Targets extends readonly string[]>(props: TargetBoundsDrawingProps<Targets>, ref: ForwardedRef<DrawingHandle>) {
	const { includeInitialView = false, margin = 0, ...drawingProps } = props
	const calculateView = useCallback<MeasuredDrawingBaseProps<Targets>['calculateView']>((targetBounds, coordinateSystem, initialCoordinateSystem) => {
		const additionalBounds = includeInitialView ? [getInitialViewBounds(coordinateSystem, initialCoordinateSystem)] : []
		return getViewAroundTargetBounds(coordinateSystem, targetBounds, margin, additionalBounds)
	}, [includeInitialView, margin])

	return <MeasuredDrawingBase {...drawingProps} calculateView={calculateView} ref={ref} />
}
