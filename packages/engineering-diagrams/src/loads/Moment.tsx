import { Arc, type ArcProps, type Distance, type Position, useDrawingCoordinateSystem } from '@step-wise/drawing'
import { ensureBoolean, ensureNumber } from '@step-wise/js-utils'

import { engineeringAngleToPixel, engineeringDirectionToPixel } from './angles.ts'

export const defaultMomentRadiusInPixels = 25
export const defaultMomentRadius: Distance = { pixelDistance: defaultMomentRadiusInPixels }

export interface MomentProps extends Omit<ArcProps, 'center' | 'radius' | 'startAngle' | 'endAngle' | 'startArrow' | 'endArrow'> {
	position: Position
	clockwise: boolean
	openingDirection?: number
	spread?: number
	radius?: Distance
	color?: string
}

export function Moment(props: MomentProps) {
	const { className = 'moment', clockwise, color = 'currentColor', openingDirection = 0, position, radius = defaultMomentRadius, ref, spread = Math.PI * 7 / 4, strokeWidth = 4, ...arcProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// Calculate the starting and ending angle of the moment.
	const direction = engineeringDirectionToPixel(ensureBoolean(clockwise), coordinateSystem.yDirection)
	const resolvedOpeningDirection = engineeringAngleToPixel(ensureNumber(openingDirection), coordinateSystem.yDirection)
	const resolvedSpread = ensureNumber(spread, { nonNegative: true, nonZero: true })
	const startAngle = resolvedOpeningDirection - direction * resolvedSpread / 2
	const endAngle = resolvedOpeningDirection + direction * resolvedSpread / 2

	// Render the moment as an arc with an arrow.
	return <Arc {...arcProps} center={position} className={className} endAngle={endAngle} endArrow radius={radius} ref={ref} startAngle={startAngle} stroke={color} strokeWidth={strokeWidth} />
}
