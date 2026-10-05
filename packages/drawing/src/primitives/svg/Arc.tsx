import { forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'

import { SvgPortal, useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { type Distance, type Position, useResolvedDistance, useResolvedPosition } from '../../positioning/index.ts'

import { getPointPath, lineStyle } from './support.ts'
import type { SvgPathProps } from './types.ts'

export interface ArcProps extends Omit<SvgPathProps, 'radius'> {
	center?: Position
	radius: Distance
	startAngle?: number
	endAngle?: number
}

export const Arc = forwardRef<SVGPathElement, ArcProps>(function Arc(props, ref) {
	const { center = [0, 0], endAngle = Math.PI, radius, startAngle = 0, style, ...pathProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// Resolve positions/distances and abort if they are not valid.
	const resolvedCenter = useResolvedPosition(center)
	const resolvedRadius = useResolvedDistance(radius)
	if (resolvedCenter === undefined || resolvedRadius === undefined) return null

	// Validate other input.
	ensureNumber(resolvedRadius, { nonNegative: true })
	ensureNumber(startAngle)
	ensureNumber(endAngle)

	// Calculate the start and end points of the arc in render coordinates.
	const start = resolvedCenter.add(coordinateSystem.pixelVectorToRender(Vector.fromPolar(resolvedRadius, startAngle)))
	const end = resolvedCenter.add(coordinateSystem.pixelVectorToRender(Vector.fromPolar(resolvedRadius, endAngle)))
	const largeArc = Math.abs(endAngle - startAngle) <= Math.PI ? 0 : 1
	const increasingAngleSweepsForward = coordinateSystem.yDirection === 'down'
	const sweep = (endAngle >= startAngle) === increasingAngleSweepsForward ? 1 : 0
	const path = `M${getPointPath(start)} A${resolvedRadius} ${resolvedRadius} 0 ${largeArc} ${sweep} ${getPointPath(end)}`

	// Render the shape.
	return <SvgPortal>
		<path {...pathProps} d={path} ref={ref} style={{ ...lineStyle, ...style }} />
	</SvgPortal>
})
