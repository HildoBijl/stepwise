import { type Force, type Load, type Moment, loadTypes } from './types'

export function reverseForce(force: Force): Force {
	return {
		...force,
		direction: force.direction.multiply(-1),
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
