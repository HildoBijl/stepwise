import { type ReactNode, forwardRef } from 'react'

import { mod } from '@step-wise/js-utils'
import { type Vector, Vector as VectorClass } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { type Anchor, type Distance, type Position, useResolvedDistance, useResolvedPosition } from '../../positioning/index.ts'

import { HtmlElement, type HtmlElementProps } from './HtmlElement.tsx'

export interface LabelProps extends Omit<HtmlElementProps, 'anchor' | 'position'> {
	children?: ReactNode
	position: Position
	distance?: Distance
	angle?: number
	anchor?: Anchor
}

export const Label = forwardRef<HTMLDivElement, LabelProps>(function Label(props, ref) {
	const { anchor, angle = -Math.PI * 3 / 4, distance = { pixelDistance: 6 }, position, rotate = 0, ...elementProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// Resolve data and abort if not known yet.
	const resolvedPosition = useResolvedPosition(position)
	const resolvedDistance = useResolvedDistance(distance)
	if (resolvedPosition === undefined || resolvedDistance === undefined) return null

	// Calculate the pixel offset based on the resolved distance and angle, then determine the final render position and anchor.
	const pixelOffset = VectorClass.fromPolar(resolvedDistance, angle)
	const renderPosition = resolvedPosition.add(coordinateSystem.pixelVectorToRender(pixelOffset))
	const resolvedAnchor = anchor ?? getAnchorFromAngle(angle - rotate + Math.PI)
	return <HtmlElement {...elementProps} anchor={resolvedAnchor} position={{ pixelPosition: coordinateSystem.renderToPixel(renderPosition) }} ref={ref} rotate={rotate} />
})

// Find the element anchor nearest to the supplied direction. Angles and the returned anchor follow pixel-coordinate directions.
export function getAnchorFromAngle(angle: number): Vector {
	const processCoordinate = (coordinateAngle: number) => {
		coordinateAngle = mod(coordinateAngle, 2 * Math.PI)
		if (coordinateAngle <= Math.PI / 4) return 1
		if (coordinateAngle < Math.PI * 3 / 4) return -Math.tan(coordinateAngle - Math.PI / 2)
		if (coordinateAngle <= Math.PI * 5 / 4) return -1
		if (coordinateAngle <= Math.PI * 7 / 4) return Math.tan(coordinateAngle - Math.PI * 3 / 2)
		return 1
	}
	return new VectorClass(processCoordinate(angle), processCoordinate(angle - Math.PI / 2))
}
