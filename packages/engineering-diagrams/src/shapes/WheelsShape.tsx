import type { SVGProps } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

export interface WheelsShapeProps extends SVGProps<SVGGElement> {
	count?: number
	radius?: number
	wheelProps?: SVGProps<SVGCircleElement>
}

export function WheelsShape({ count = 4, radius = 4, wheelProps, ...groupProps }: WheelsShapeProps) {
	// Determine wheel properties.
	const resolvedCount = ensureNumber(count, { nonNegative: true, nonZero: true })
	if (!Number.isInteger(resolvedCount)) throw new Error('Invalid Wheels count: expected an integer.')
	const resolvedRadius = ensureNumber(radius, { nonNegative: true })

	// Render the wheels.
	return <g {...groupProps}>
		{Array.from({ length: resolvedCount }, (_, index) => <circle {...wheelProps} cx={(2 * index + 1 - resolvedCount) * resolvedRadius} cy={0} fill={wheelProps?.fill ?? 'currentColor'} key={index} r={resolvedRadius} strokeWidth={wheelProps?.strokeWidth ?? 0} />)}
	</g>
}
