import { forwardRef } from 'react'

import { Line, type LineProps } from './Line.tsx'

export type PolygonProps = Omit<LineProps, 'close'>

export const Polygon = forwardRef<SVGPathElement, PolygonProps>(function Polygon(props, ref) {
	return <Line {...props} close ref={ref} />
})
