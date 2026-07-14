import { normalizeAngle } from '@step-wise/utils'

import { type Force, type Load, type Moment, loadTypes } from './types'

export function reverseForce(force: Force): Force {
	return {
		...force,
		angle: normalizeAngle(force.angle + Math.PI),
	}
}

export function reverseMoment(moment: Moment): Moment {
	return {
		...moment,
		clockwise: !moment.clockwise,
	}
}

export function reverseLoad(load: Force): Force
export function reverseLoad(load: Moment): Moment
export function reverseLoad(load: Load): Load
export function reverseLoad(load: Load): Load {
	switch (load.type) {
		case loadTypes.force: return reverseForce(load)
		case loadTypes.moment: return reverseMoment(load)
	}
}

export function getAxisComponents(force: Force): [Force, Force] {
	const xAngle = Math.round(force.angle / Math.PI) * Math.PI
	const yAngle = (Math.round(force.angle / Math.PI - 1 / 2) + 1 / 2) * Math.PI
	return [
		{ ...force, angle: xAngle },
		{ ...force, angle: yAngle },
	]
}
