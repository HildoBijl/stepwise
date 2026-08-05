import { type Force, type Load, type Moment, loadTypes } from './types'
import { createForce, createMoment } from './creation'

export function reverseForce(force: Force): Force {
	return createForce({
		...force,
		angle: force.angle + Math.PI,
	})
}

export function reverseMoment(moment: Moment): Moment {
	return createMoment({
		...moment,
		clockwise: !moment.clockwise,
	})
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
		createForce({ ...force, angle: xAngle }),
		createForce({ ...force, angle: yAngle }),
	]
}
