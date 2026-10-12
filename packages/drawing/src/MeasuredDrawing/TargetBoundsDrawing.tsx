import { useCallback } from 'react'

import type { Margin } from '../transforms/index.ts'

import { type MeasuredDrawingFigureProps, type MeasuredDrawingProps, MeasuredDrawing, MeasuredDrawingFigure } from './MeasuredDrawing.tsx'
import { getViewAroundTargetBounds } from './targetBoundsView.ts'

export type TargetBoundsDrawingProps<Targets extends readonly string[]> = Omit<MeasuredDrawingProps<Targets>, 'calculateView'> & {
	margin?: Margin
}

export type TargetBoundsDrawingFigureProps<Targets extends readonly string[]> = Omit<MeasuredDrawingFigureProps<Targets>, 'calculateView'> & {
	margin?: Margin
}

export function TargetBoundsDrawing<const Targets extends readonly string[]>({ margin = 0, ...drawingProps }: TargetBoundsDrawingProps<Targets>) {
	const calculateView = useCallback<MeasuredDrawingProps<Targets>['calculateView']>((targetBounds, coordinateSystem) => getViewAroundTargetBounds(targetBounds, coordinateSystem, margin), [margin])
	return <MeasuredDrawing {...drawingProps} calculateView={calculateView} />
}

export function TargetBoundsDrawingFigure<const Targets extends readonly string[]>({ margin = 0, ...drawingProps }: TargetBoundsDrawingFigureProps<Targets>) {
	const calculateView = useCallback<MeasuredDrawingFigureProps<Targets>['calculateView']>((targetBounds, coordinateSystem) => getViewAroundTargetBounds(targetBounds, coordinateSystem, margin), [margin])
	return <MeasuredDrawingFigure {...drawingProps} calculateView={calculateView} />
}
