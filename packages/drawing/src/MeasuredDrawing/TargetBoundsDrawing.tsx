import { useCallback } from 'react'

import type { Margin } from '../transforms/index.ts'

import { type MeasuredDrawingProps, MeasuredDrawing } from './MeasuredDrawing.tsx'
import { getViewAroundTargetBounds } from './targetBoundsView.ts'

export type TargetBoundsDrawingProps<Targets extends readonly string[]> = Omit<MeasuredDrawingProps<Targets>, 'calculateView'> & {
	margin?: Margin
}

export function TargetBoundsDrawing<const Targets extends readonly string[]>({ margin = 0, ...drawingProps }: TargetBoundsDrawingProps<Targets>) {
	const calculateView = useCallback<MeasuredDrawingProps<Targets>['calculateView']>((targetBounds, coordinateSystem) => getViewAroundTargetBounds(targetBounds, coordinateSystem, margin), [margin])
	return <MeasuredDrawing {...drawingProps} calculateView={calculateView} />
}
