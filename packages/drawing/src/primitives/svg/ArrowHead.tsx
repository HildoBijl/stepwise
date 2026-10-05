import { type SVGProps, forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'
import { type Vector, type VectorLike, ensureVector } from '@step-wise/geometry'

import { SvgPortal, useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { type Distance, type Position, useResolvedDistance, useResolvedPosition } from '../../positioning/index.ts'

export const defaultArrowHeadSize = { pixelDistance: 12 } as const

export interface ArrowHeadProps extends Omit<SVGProps<SVGPolygonElement>, 'direction' | 'points' | 'position' | 'size'> {
	position: Position
	direction: VectorLike
	size?: Distance
}

export type ArrowHeadOptions = Omit<ArrowHeadProps, 'direction' | 'position'>
export type ArrowHeadInput = boolean | ArrowHeadOptions

export interface ArrowedPathProps {
	startArrow?: ArrowHeadInput
	endArrow?: ArrowHeadInput
}

export const ArrowHead = forwardRef<SVGPolygonElement, ArrowHeadProps>(function ArrowHead(props, ref) {
	const { direction, position, size = defaultArrowHeadSize, ...polygonProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// Resolve the position and size, and abort if they are not valid.
	const resolvedPosition = useResolvedPosition(position)
	const resolvedSize = useResolvedDistance(size)
	if (resolvedPosition === undefined || resolvedSize === undefined) return null

	// Validate the direction and convert it to render coordinates.
	const drawingDirection = ensureVector(direction, { dimension: 2 })
	const renderDirection = coordinateSystem.pixelVectorToRender(coordinateSystem.drawingVectorToPixel(drawingDirection))

	// Render the arrowhead at the resolved position with the specified direction and size.
	return <SvgPortal>
		<ResolvedArrowHead {...polygonProps} direction={renderDirection} position={resolvedPosition} ref={ref} size={resolvedSize} />
	</SvgPortal>
})

interface ResolvedArrowHeadProps extends Omit<SVGProps<SVGPolygonElement>, 'direction' | 'points' | 'position' | 'size'> {
	position: Vector
	direction: Vector
	size: number
}

// Render an arrowhead from values that have already been converted to render coordinates.
export const ResolvedArrowHead = forwardRef<SVGPolygonElement, ResolvedArrowHeadProps>(function ResolvedArrowHead(props, ref) {
	const { direction, fill = 'currentColor', position, size, ...polygonProps } = props

	// Validate the size and direction.
	const resolvedSize = ensureNumber(size, { nonNegative: true, nonZero: true })
	if (direction.isZero()) throw new Error('Invalid ArrowHead direction: expected a non-zero vector.')

	// Calculate the points of the arrowhead polygon based on the size and direction.
	const halfWidth = resolvedSize / 2
	const notch = resolvedSize * 0.75
	const points = `0 0, ${-resolvedSize} ${-halfWidth}, ${-notch} 0, ${-resolvedSize} ${halfWidth}`
	const transform = `translate(${position.x} ${position.y}) rotate(${direction.angle * 180 / Math.PI})`

	// Render the arrowhead polygon.
	return <polygon {...polygonProps} fill={fill} points={points} ref={ref} transform={transform} />
})

export function resolveArrowHeadOptions(input?: ArrowHeadInput): ArrowHeadOptions | undefined {
	if (input === undefined || input === false) return undefined
	return input === true ? {} : input
}

export function getArrowHeadInset(size: number): number {
	return ensureNumber(size, { nonNegative: true, nonZero: true }) * 0.75
}
