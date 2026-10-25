import { Line, type LineProps } from './Line.tsx'

export type PolygonProps = Omit<LineProps, 'close'>

export function Polygon(props: PolygonProps) {
	return <Line {...props} close />
}
