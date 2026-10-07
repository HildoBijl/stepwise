import type { PlotAxis } from '../types.ts'

import { Axis, type AxisProps } from './Axis.tsx'

export type XAxisProps = AxisProps
export type YAxisProps = AxisProps
export type AxesProps = Partial<Record<PlotAxis, AxisProps | false>>

export function XAxis(props: XAxisProps) {
	return <Axis {...props} axis="x" />
}

export function YAxis(props: YAxisProps) {
	return <Axis {...props} axis="y" />
}

export function Axes({ x = {}, y = {} }: AxesProps) {
	return <>
		{x !== false && <XAxis {...x} />}
		{y !== false && <YAxis {...y} />}
	</>
}
