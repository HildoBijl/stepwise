import type { SVGProps } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

export interface HingeShapeProps extends SVGProps<SVGCircleElement> {
	radius?: number
	thickness?: number
}

export function HingeShape(props: HingeShapeProps) {
	const { fill = 'white', radius = 6, stroke = 'currentColor', strokeWidth, thickness = 2, ...circleProps } = props
	const resolvedRadius = ensureNumber(radius, { nonNegative: true })
	const resolvedThickness = ensureNumber(strokeWidth ?? thickness, { nonNegative: true })
	return <circle {...circleProps} cx={0} cy={0} fill={fill} r={resolvedRadius} stroke={stroke} strokeWidth={resolvedThickness} />
}
