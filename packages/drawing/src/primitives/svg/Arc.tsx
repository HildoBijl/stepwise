import { forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'

import { SvgPortal, useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { type Distance, type Position, useDrawingPixelDistance } from '../../positioning/index.ts'

import { useRenderPosition } from '../resolution.ts'

import { type ArrowedPathProps, getArrowHeadDirectionInset, getArrowHeadInset, getDefaultPathArrowHeadSize, ResolvedArrowHead, resolveArrowHeadOptions } from './ArrowHead.tsx'
import { getPointPath } from './support.ts'
import type { SvgPathProps } from './types.ts'

export interface ArcProps extends Omit<SvgPathProps, 'radius'>, ArrowedPathProps {
	center?: Position
	radius: Distance
	startAngle?: number
	endAngle?: number
}

export const Arc = forwardRef<SVGPathElement, ArcProps>(function Arc(props, ref) {
	const { center = [0, 0], endAngle = Math.PI, endArrow, fill = 'none', radius, startAngle = 0, startArrow, stroke = 'currentColor', strokeWidth = 1, ...pathProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()
	const startArrowOptions = resolveArrowHeadOptions(startArrow)
	const endArrowOptions = resolveArrowHeadOptions(endArrow)

	// Resolve positions/distances and abort if they are not valid.
	const resolvedCenter = useRenderPosition(center)
	const resolvedRadius = useDrawingPixelDistance(radius)
	const defaultArrowSize = getDefaultPathArrowHeadSize(strokeWidth)
	const startArrowSize = useDrawingPixelDistance(startArrowOptions?.size ?? defaultArrowSize)
	const endArrowSize = useDrawingPixelDistance(endArrowOptions?.size ?? defaultArrowSize)
	if (resolvedCenter === undefined || resolvedRadius === undefined || startArrowSize === undefined || endArrowSize === undefined) return null

	// Validate other input.
	ensureNumber(resolvedRadius, { nonNegative: true, nonZero: !!(startArrowOptions || endArrowOptions) })
	const resolvedStartAngle = ensureNumber(startAngle)
	const resolvedEndAngle = ensureNumber(endAngle)
	const angleDifference = resolvedEndAngle - resolvedStartAngle
	ensureNumber(angleDifference, { nonZero: !!(startArrowOptions || endArrowOptions) })
	const directionSign = angleDifference < 0 ? -1 : 1

	// Pull the arc endpoints underneath any arrowheads without allowing them to pass one another.
	const maximumInsetAngle = Math.abs(angleDifference) / ((startArrowOptions && endArrowOptions) ? 2 : 1)
	const startInsetAngle = startArrowOptions ? Math.min(getArrowHeadInset(startArrowSize) / resolvedRadius, maximumInsetAngle) : 0
	const endInsetAngle = endArrowOptions ? Math.min(getArrowHeadInset(endArrowSize) / resolvedRadius, maximumInsetAngle) : 0
	const shaftStartAngle = resolvedStartAngle + directionSign * startInsetAngle
	const shaftEndAngle = resolvedEndAngle - directionSign * endInsetAngle

	// Aim the arrowheads along the part of the arc underneath them instead of using the exact tangent at their tips.
	const getTangent = (angle: number) => coordinateSystem.pixelVectorToRender(new Vector(-Math.sin(angle), Math.cos(angle))).multiply(directionSign)
	const startDirectionInset = startArrowOptions ? Math.min(getArrowHeadDirectionInset(startArrowSize) / resolvedRadius, maximumInsetAngle) : 0
	const endDirectionInset = endArrowOptions ? Math.min(getArrowHeadDirectionInset(endArrowSize) / resolvedRadius, maximumInsetAngle) : 0
	const startDirection = getTangent(resolvedStartAngle + directionSign * startDirectionInset).negate()
	const endDirection = getTangent(resolvedEndAngle - directionSign * endDirectionInset)
	const { size: _startSize, fill: startFill = stroke, ...startPolygonProps } = startArrowOptions ?? {}
	const { size: _endSize, fill: endFill = stroke, ...endPolygonProps } = endArrowOptions ?? {}

	// Calculate the arc's path based on the adjusted endpoints from the arrow calculation.
	const getPoint = (angle: number) => resolvedCenter.add(coordinateSystem.pixelVectorToRender(Vector.fromPolar(resolvedRadius, angle)))
	const start = getPoint(resolvedStartAngle)
	const end = getPoint(resolvedEndAngle)
	const shaftStart = getPoint(shaftStartAngle)
	const shaftEnd = getPoint(shaftEndAngle)
	const largeArc = Math.abs(shaftEndAngle - shaftStartAngle) <= Math.PI ? 0 : 1
	const increasingAngleSweepsForward = coordinateSystem.yDirection === 'down'
	const sweep = (shaftEndAngle >= shaftStartAngle) === increasingAngleSweepsForward ? 1 : 0
	const path = `M${getPointPath(shaftStart)} A${resolvedRadius} ${resolvedRadius} 0 ${largeArc} ${sweep} ${getPointPath(shaftEnd)}`

	// Render the arc with any arrowheads.
	return <SvgPortal>
		<path {...pathProps} d={path} fill={fill} ref={ref} stroke={stroke} strokeWidth={strokeWidth} />
		{startArrowOptions && <ResolvedArrowHead {...startPolygonProps} direction={startDirection} fill={startFill} position={start} size={startArrowSize} />}
		{endArrowOptions && <ResolvedArrowHead {...endPolygonProps} direction={endDirection} fill={endFill} position={end} size={endArrowSize} />}
	</SvgPortal>
})
