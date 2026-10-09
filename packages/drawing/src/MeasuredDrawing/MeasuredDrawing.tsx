import type { CSSProperties, Ref } from 'react'

import { Drawing } from '../Drawing/Drawing.tsx'
import type { DrawingHandle, DrawingProps } from '../Drawing/types.ts'
import type { DrawingCoordinateSystem, DrawingView } from '../transforms/index.ts'

import { MeasuredViewController, useMeasuredDrawingState } from './MeasuredViewController.tsx'
import type { TargetBoundsRecord } from './targetBounds.ts'

export type MeasuredDrawingProps<Targets extends readonly string[]> = Omit<DrawingProps, 'view'> & {
	initialView?: DrawingView
	targets: Targets
	calculateView: (targetBounds: TargetBoundsRecord<Targets>, coordinateSystem: DrawingCoordinateSystem) => DrawingView | undefined
	pendingVisibility?: 'hidden' | 'visible'
	ref?: Ref<DrawingHandle>
}

export const defaultMeasuredDrawingView: DrawingView = { type: 'identity', width: 800, height: 600 }

export function MeasuredDrawing<const Targets extends readonly string[]>({ calculateView, children, initialView = defaultMeasuredDrawingView, pendingVisibility = 'hidden', style, targets, ...drawingProps }: MeasuredDrawingProps<Targets>) {
	// Track whether the view has been resolved.
	const { ready, resolveView, view } = useMeasuredDrawingState(initialView)

	// Render the Drawing. Make it invisible if the bounds are still being determined.
	const resolvedStyle: CSSProperties | undefined = !ready && pendingVisibility === 'hidden' ? { ...style, visibility: 'hidden' } : style
	return <Drawing {...drawingProps} style={resolvedStyle} view={view}>
		<MeasuredViewController calculateView={calculateView} onResolve={resolveView} targets={targets} />
		{children}
	</Drawing>
}
