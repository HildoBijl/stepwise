import { ensureNumber } from '@step-wise/js-utils'
import { type RectangleLike, ensureRectangle } from '@step-wise/geometry'

import { SvgPortal } from '../../Drawing/index.ts'
import { type Distance, type Position, useDrawingPixelDistance } from '../../positioning/index.ts'

import { useRenderPositions } from '../resolution.ts'

import type { SvgRectangleProps } from './types.ts'

type RectangleDefinitionProps =
	| { rectangle: RectangleLike; corners?: never }
	| { corners: readonly [Position, Position]; rectangle?: never }

export type RectangleProps = SvgRectangleProps & RectangleDefinitionProps & {
	cornerRadius?: Distance
}

export function Rectangle(props: RectangleProps) {
	const { corners, rectangle, cornerRadius = { pixelDistance: 0 }, ...rectangleProps } = props

	// Resolve positions/distances and abort if they are not valid.
	if (corners !== undefined && rectangle !== undefined) throw new Error('Invalid Rectangle definition: expected "corners" or "rectangle", but not both.')
	if (corners !== undefined && (!Array.isArray(corners) || corners.length !== 2)) throw new Error('Invalid Rectangle corners: expected exactly two positions.')
	let positions: readonly [Position, Position]
	if (corners !== undefined) {
		positions = corners
	} else {
		if (rectangle === undefined) throw new Error('Invalid Rectangle definition: expected "corners" or "rectangle".')
		const ensuredRectangle = ensureRectangle(rectangle, { dimension: 2 })
		positions = [ensuredRectangle.min, ensuredRectangle.max]
	}
	const resolvedCorners = useRenderPositions(positions)
	const resolvedRadius = useDrawingPixelDistance(cornerRadius)
	if (resolvedCorners === undefined || resolvedRadius === undefined) return null
	ensureNumber(resolvedRadius, { nonNegative: true })

	// Calculate the top-left corner of the rectangle and its width and height based on the resolved corners.
	const [first, second] = resolvedCorners
	const x = Math.min(first.x, second.x)
	const y = Math.min(first.y, second.y)
	const width = Math.abs(second.x - first.x)
	const height = Math.abs(second.y - first.y)

	// Render the shape.
	return <SvgPortal>
		<rect {...rectangleProps} height={height} rx={resolvedRadius} width={width} x={x} y={y} />
	</SvgPortal>
}
