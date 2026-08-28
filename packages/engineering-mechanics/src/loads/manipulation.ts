import { approximatelyEqual } from '@step-wise/js-utils'

import { type Force, type Load, type Moment, ForceType, MomentType } from './types.ts'
import { createForce, createMoment } from './creation.ts'

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
		case ForceType: return reverseForce(load)
		case MomentType: return reverseMoment(load)
	}
}

export function decomposeForceIntoAxisComponents(force: Force): Force[] {
	const xAngle = Math.round(force.angle / Math.PI) * Math.PI
	const yAngle = (Math.round(force.angle / Math.PI - 1 / 2) + 1 / 2) * Math.PI
	const components = [
		{ angle: xAngle, relativeMagnitude: force.relativeMagnitude * Math.abs(Math.cos(force.angle)) },
		{ angle: yAngle, relativeMagnitude: force.relativeMagnitude * Math.abs(Math.sin(force.angle)) },
	]
	return components.filter(component => !approximatelyEqual(component.relativeMagnitude, 0)).map(component => createForce({ ...force, ...component }))
}
