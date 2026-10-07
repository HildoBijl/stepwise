import { type SVGProps, forwardRef } from 'react'

import { SvgPortal } from '../Drawing/index.ts'

import { usePlot } from './context.ts'

export interface PlotAreaProps extends Omit<SVGProps<SVGGElement>, 'clip'> {
	clip?: boolean
}

export const PlotArea = forwardRef<SVGGElement, PlotAreaProps>(function PlotArea(props, ref) {
	const { children, clip = true, ...groupProps } = props
	const { clipPathId } = usePlot()
	return <SvgPortal>
		<g {...groupProps} clipPath={clip ? `url(#${clipPathId})` : undefined} ref={ref}>{children}</g>
	</SvgPortal>
})
