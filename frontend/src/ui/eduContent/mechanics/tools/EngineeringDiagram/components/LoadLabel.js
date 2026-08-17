import { ensureNumber } from '@step-wise/js-utils'
import { asExpression } from '@step-wise/cas'
import { loadTypes, createLoad } from '@step-wise/engineering-mechanics'
import { loadNameToVariable } from '@step-wise/mechanics-exercises'

import { M } from 'ui/components'
import { Label } from 'ui/figures'

import { defaultGraphicalForceLength, defaultGraphicalMomentRadius } from '../../support'

import { defaultMoment } from './loads/Moment'

const forceGraphicalDistance = 2
const momentGraphicalDistance = 4
const momentAngleDeviation = Math.PI / 12

export default function LoadLabel({ load, name, variable, magnitude }) {
	// Check the input.
	load = createLoad(load)
	variable = variable === undefined ? loadNameToVariable(name) : asExpression(variable)
	magnitude = ensureNumber(magnitude ?? load.magnitudeFactor ?? 1)

	// Set up the Label based on the load type.
	switch (load.type) {
		// For a force, either put the label at the start or at the end, depending on which point it is connected to.
		case loadTypes.force:
			if (load.applicationPointAt === 'end') {
				return <Label position={load.position} angle={load.angle - Math.PI} {...{ graphicalDistance: magnitude * defaultGraphicalForceLength + forceGraphicalDistance }}><M>{variable}</M></Label>
			} else {
				return <Label position={load.position} angle={load.angle} {...{ graphicalDistance: magnitude * defaultGraphicalForceLength + forceGraphicalDistance }}><M>{variable}</M></Label>
			}

		// For a moment, put the label near the moment arrow.
		case loadTypes.moment:
			// Determine the angle at which the arrow ends.
			const { position, clockwise, openingAngle } = load
			const angle = openingAngle + (clockwise ? -1 : 1) * ((2 * Math.PI - defaultMoment.spread) / 2 + momentAngleDeviation)

			// If the radius is not known, we must fully work in graphical coordinates.
			return <Label position={position} {...{ angle }} graphicalDistance={defaultGraphicalMomentRadius + momentGraphicalDistance}><M>{variable}</M></Label>

		default:
			throw new Error(`Invalid load type: cannot display a load label for a load of type "${load.type}".`)
	}
}
