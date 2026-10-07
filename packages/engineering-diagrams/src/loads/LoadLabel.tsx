import type { ReactNode, Ref } from 'react'

import { Label, type LabelProps, type Distance, type Position, useResolvedDistance } from '@step-wise/drawing'
import { createLoad, ForceType, type Load, type LoadInput } from '@step-wise/engineering-mechanics'

import { defaultForceLength } from './Force.tsx'
import { defaultMomentRadius } from './Moment.tsx'

export interface LoadLabelProps extends Omit<LabelProps, 'position' | 'distance' | 'angle'> {
	load: Load | LoadInput
	children?: ReactNode
	position?: Position
	forceLength?: Distance
	forceGap?: number
	momentRadius?: Distance
	momentGap?: number
	momentAngleDeviation?: number
	ref?: Ref<HTMLDivElement>
}

export function LoadLabel(props: LoadLabelProps) {
	const { children, forceGap = 6, forceLength = defaultForceLength, load: loadInput, momentAngleDeviation = Math.PI / 12, momentGap = 6, momentRadius = defaultMomentRadius, position, ref, ...labelProps } = props

	// Resolve all lengths and abort on missing data.
	const resolvedForceLength = useResolvedDistance(forceLength)
	const resolvedMomentRadius = useResolvedDistance(momentRadius)
	if (resolvedForceLength === undefined || resolvedMomentRadius === undefined) return null
	
	// Determine the load and the label's position.
	const load = createLoad(loadInput)
	const labelPosition = position ?? load.position

	// Render the label for a Force.
	if (load.type === ForceType) {
		const distance = { pixelDistance: resolvedForceLength * load.relativeMagnitude + forceGap }
		const angle = load.angle + (load.applicationPointAt === 'end' ? Math.PI : 0)
		return <Label {...labelProps} angle={angle} distance={distance} position={labelPosition} ref={ref}>{children}</Label>
	}

	// Render the label for a Moment.
	const direction = load.clockwise ? -1 : 1
	const angle = load.openingDirection + direction * (Math.PI / 8 + momentAngleDeviation)
	return <Label {...labelProps} angle={angle} distance={{ pixelDistance: resolvedMomentRadius + momentGap }} position={labelPosition} ref={ref}>{children}</Label>
}
