import { processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry'
import { Variable } from 'step-wise/CAS'
import { loadTypes, ensureLoad } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { M } from 'ui/components/equations'
import { Label } from 'ui/components/figures/Drawing'

import { defaultMoment } from './loads'

const forceGraphicalDistance = 2
const momentGraphicalDistance = 4
const momentAngleDeviation = Math.PI / 12

export function LoadLabel({ load, variable, point }) {
	// Check the input.
	load = ensureLoad(load)
	variable = Variable.ensureVariable(variable)
	point = ensureVector(point, 2)

	// Set up the Label based on the load type.
	switch (load.type) {
		// For a force, either put the label at the start or at the end, depending on which point it is connected to.
		case loadTypes.force:
			if (load.positionedVector.end.equals(point))
				return <Label position={load.positionedVector.start} angle={load.positionedVector.vector.argument - Math.PI} {...{ graphicalDistance: forceGraphicalDistance }}><M>{variable}</M></Label>
			else
				return <Label position={load.positionedVector.end} angle={load.positionedVector.vector.argument} {...{ graphicalDistance: forceGraphicalDistance }}><M>{variable}</M></Label>

		// For a moment, put the label near the moment arrow.
		case loadTypes.moment:
			// Determine the angle at which the arrow ends.
			const { position, opening, clockwise, spread, radius, graphicalRadius } = processOptions(load, defaultMoment, true)
			const angle = opening + (clockwise ? -1 : 1) * ((2 * Math.PI - spread) / 2 + momentAngleDeviation)

			// An important question is whether the radius is known. If so, we can determine the exact endpoint and displace the label from there.
			if (radius !== undefined) {
				const point = position.add(Vector.fromPolar(radius, angle))
				return <Label position={point} {...{ angle, graphicalDistance: momentGraphicalDistance }}><M>{variable}</M></Label>
			}

			// If the radius is not known, we must fully work in graphical coordinates.
			return <Label position={position} {...{ angle }} graphicalDistance={graphicalRadius + momentGraphicalDistance}><M>{variable}</M></Label>

		default:
			throw new Error(`Invalid load type: cannot display a load label for a load of type "${load.type}".`)
	}
}