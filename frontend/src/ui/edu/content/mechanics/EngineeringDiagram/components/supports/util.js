import { Vector } from 'step-wise/geometry/Vector'

import { defaultObject } from 'ui/components/figures/Drawing/components/SvgComponents/util'

import { Beam, Hinge } from '../structuralComponents'

// The defaultSupport is inherited by each of the default support objects.
export const defaultSupport = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	angle: Math.PI / 2,
	color: Beam.defaultProps.color,
	thickness: Hinge.defaultProps.thickness,
	groundOptions: {},
}
