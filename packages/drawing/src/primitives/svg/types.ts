import type { SVGProps } from 'react'

import type { Position } from '../../positioning/index.ts'

export type SvgPathProps = Omit<SVGProps<SVGPathElement>, 'd'>
export type SvgCircleProps = Omit<SVGProps<SVGCircleElement>, 'cx' | 'cy' | 'r' | 'radius'>
export type SvgRectangleProps = Omit<SVGProps<SVGRectElement>, 'height' | 'width' | 'x' | 'y'>

export interface PointSequenceProps {
	positions: readonly Position[]
	close?: boolean
}
