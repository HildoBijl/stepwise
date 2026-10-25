import type { SVGProps } from 'react'

import { SvgPortal } from '../Drawing/index.ts'

import { usePlot } from './context.ts'

export interface PlotAreaProps extends Omit<SVGProps<SVGGElement>, 'clip'> {
	clip?: boolean
}

export function PlotArea(props: PlotAreaProps) {
	const { children, clip = true, ref, ...groupProps } = props
	const { clipPathId } = usePlot()
	return <SvgPortal>
		<g {...groupProps} clipPath={clip ? `url(#${clipPathId})` : undefined} ref={ref}>{children}</g>
	</SvgPortal>
}
