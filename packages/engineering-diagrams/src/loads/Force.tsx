import { type Distance, type LineProps, type Position, Line, useDrawingCoordinateSystem, useDrawingPixelDistance } from '@step-wise/drawing'
import { type ApplicationPointPosition } from '@step-wise/engineering-mechanics'
import { Vector } from '@step-wise/geometry'
import { ensureNumber } from '@step-wise/js-utils'

import { engineeringAngleToPixel } from './angles.ts'

export const defaultForceLengthInPixels = 70
export const defaultForceLength: Distance = { pixelDistance: defaultForceLengthInPixels }

export interface ForceProps extends Omit<LineProps, 'positions' | 'startArrow' | 'endArrow'> {
	position: Position
	angle: number
	applicationPointAt?: ApplicationPointPosition
	relativeMagnitude?: number
	length?: Distance
	color?: string
}

export function Force(props: ForceProps) {
	const { angle, applicationPointAt = 'end', className = 'force', color = 'currentColor', length = defaultForceLength, position, ref, relativeMagnitude = 1, strokeWidth = 4, ...lineProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// Calculate the arrow length in pixels.
	const resolvedLength = useDrawingPixelDistance(length)
	if (resolvedLength === undefined) return null
	const magnitude = resolvedLength * ensureNumber(relativeMagnitude, { nonNegative: true, nonZero: true })

	// Calculate the second point of the vector. Due to different coordinate systems, use a calculate function.
	const pixelAngle = engineeringAngleToPixel(ensureNumber(angle), coordinateSystem.yDirection)
	const offset = Vector.fromPolar(magnitude, pixelAngle)
	const displacedPosition: Position = { positions: [position], calculate: ([resolvedPosition]) => resolvedPosition.add(applicationPointAt === 'start' ? offset : offset.negate()) }
	const positions = applicationPointAt === 'start' ? [position, displacedPosition] : [displacedPosition, position]

	// Render the force as a line with arrow.
	return <Line {...lineProps} className={className} endArrow positions={positions} ref={ref} stroke={color} strokeWidth={strokeWidth} />
}
