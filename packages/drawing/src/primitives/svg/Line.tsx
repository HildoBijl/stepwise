import { forwardRef } from 'react'

import { first, last } from '@step-wise/js-utils'

import { SvgPortal } from '../../Drawing/index.ts'
import { useResolvedDistance, useResolvedPositions } from '../../positioning/index.ts'

import { type ArrowedPathProps, getDefaultPathArrowHeadSize, ResolvedArrowHead, resolveArrowHeadOptions } from './ArrowHead.tsx'
import { getLinePath, prepareArrowedPositions } from './support.ts'
import type { PointSequenceProps, SvgPathProps } from './types.ts'

export interface LineProps extends SvgPathProps, PointSequenceProps, ArrowedPathProps { }

export const Line = forwardRef<SVGPathElement, LineProps>(function Line(props, ref) {
	const { close = false, endArrow, fill = 'none', positions, startArrow, stroke = 'currentColor', strokeWidth = 2, ...pathProps } = props
	const startArrowOptions = resolveArrowHeadOptions(startArrow)
	const endArrowOptions = resolveArrowHeadOptions(endArrow)

	// Resolve positions and abort if they are not valid.
	const resolvedPositions = useResolvedPositions(positions)
	const defaultArrowSize = getDefaultPathArrowHeadSize(strokeWidth)
	const startArrowSize = useResolvedDistance(startArrowOptions?.size ?? defaultArrowSize)
	const endArrowSize = useResolvedDistance(endArrowOptions?.size ?? defaultArrowSize)
	if (resolvedPositions === undefined || startArrowSize === undefined || endArrowSize === undefined) return null

	// Calculate arrow directions and pull the line endpoints underneath any arrowheads.
	if (close && (startArrowOptions || endArrowOptions)) throw new Error('Invalid Line arrows: closed lines cannot have start or end arrows.')
	const arrowedPositions = startArrowOptions || endArrowOptions ? prepareArrowedPositions(resolvedPositions, startArrowOptions ? startArrowSize : undefined, endArrowOptions ? endArrowSize : undefined) : undefined
	const shaftPositions = arrowedPositions?.shaftPositions ?? resolvedPositions
	const { size: _startSize, fill: startFill = stroke, ...startPolygonProps } = startArrowOptions ?? {}
	const { size: _endSize, fill: endFill = stroke, ...endPolygonProps } = endArrowOptions ?? {}

	// Render the shape.
	return <SvgPortal>
		<path {...pathProps} d={getLinePath(shaftPositions, close)} fill={fill} ref={ref} stroke={stroke} strokeWidth={strokeWidth} />
		{startArrowOptions && <ResolvedArrowHead {...startPolygonProps} direction={arrowedPositions!.directions.startDirection} fill={startFill} position={first(resolvedPositions)} size={startArrowSize} />}
		{endArrowOptions && <ResolvedArrowHead {...endPolygonProps} direction={arrowedPositions!.directions.endDirection} fill={endFill} position={last(resolvedPositions)} size={endArrowSize} />}
	</SvgPortal>
})
