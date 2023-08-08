
import { mod } from 'step-wise/util'
import { Vector } from 'step-wise/geometry'

// getAnchorFromAngle takes an angle in radians (for instance pi/2) and returns an anchor Vector from it (for instance (0,1). The angle is interpreted as counterclockwise from the positive x-axis, as is standard in mathematics.
export function getAnchorFromAngle(angle) {
	const processCoordinate = (angle) => {
		// Prepare the angle.
		angle = mod(angle, 2 * Math.PI)

		// Check various cases.
		if (angle <= Math.PI / 4)
			return 1
		if (angle < Math.PI * 3 / 4)
			return 0.5 - 0.5 * Math.tan(angle - Math.PI / 2)
		if (angle <= Math.PI * 5 / 4)
			return 0
		if (angle <= Math.PI * 7 / 4)
			return 0.5 + 0.5 * Math.tan(angle - Math.PI * 3 / 2)
		return 1
	}
	return new Vector(processCoordinate(angle), processCoordinate(angle - Math.PI / 2))
}
