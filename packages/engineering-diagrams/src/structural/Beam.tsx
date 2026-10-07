import type { SVGProps } from 'react'

import { SvgPortal, type Position, useResolvedPositions } from '@step-wise/drawing'
import { ensureNumber } from '@step-wise/js-utils'

export interface BeamProps extends Omit<SVGProps<SVGGElement>, 'color'> {
	positions: readonly Position[]
	thickness?: number
	strutSize?: number
	strutOpacity?: number
	color?: string
	lineProps?: SVGProps<SVGPathElement>
	strutProps?: SVGProps<SVGPolygonElement>
}

export function Beam(props: BeamProps) {
	const { className = 'beam', color = 'currentColor', lineProps, positions, ref, strutOpacity = 0.75, strutProps, strutSize = 12, style, thickness = 6, ...groupProps } = props

	// Determine the path of the beam.
	const resolvedPositions = useResolvedPositions(positions)
	if (resolvedPositions === undefined) return null
	if (resolvedPositions.length < 2) throw new Error('Invalid Beam positions: expected at least two positions.')
	const path = `M${resolvedPositions.map(point => `${point.x} ${point.y}`).join(' L')}`

	// Determine the other properties.
	const resolvedThickness = ensureNumber(thickness, { nonNegative: true, nonZero: true })
	const resolvedStrutSize = ensureNumber(strutSize, { nonNegative: true })
	const resolvedStrutOpacity = ensureNumber(strutOpacity, { nonNegative: true })

	// Render the beam.
	return <SvgPortal>
		<g {...groupProps} className={className} ref={ref} style={{ color, ...style }}>
			{/* Beam corner triangles. */}
			{resolvedPositions.map((point, index) => {
				if (index === 0 || index === resolvedPositions.length - 1) return null
				if (point.equals(resolvedPositions[index - 1]) || point.equals(resolvedPositions[index + 1])) return null
				const previous = resolvedPositions[index - 1].subtract(point).normalize().multiply(resolvedStrutSize).add(point)
				const next = resolvedPositions[index + 1].subtract(point).normalize().multiply(resolvedStrutSize).add(point)
				return <polygon {...strutProps} className={strutProps?.className ?? 'beamStrut'} fill={strutProps?.fill ?? 'currentColor'} key={index} opacity={strutProps?.opacity ?? resolvedStrutOpacity} points={`${point.x} ${point.y}, ${next.x} ${next.y}, ${previous.x} ${previous.y}`} strokeWidth={strutProps?.strokeWidth ?? 0} />
			})}

			{/* Beam line. */}
			<path {...lineProps} className={lineProps?.className ?? 'beamLine'} d={path} fill={lineProps?.fill ?? 'none'} stroke={lineProps?.stroke ?? 'currentColor'} strokeWidth={lineProps?.strokeWidth ?? resolvedThickness} />
		</g>
	</SvgPortal>
}
