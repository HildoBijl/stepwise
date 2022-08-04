import { toFO, toSO } from 'step-wise/inputTypes'
import { loadTypes } from 'step-wise/edu/exercises/util/engineeringMechanics'

// These are functions transforming between object types.

// clean will remove all selection data from the FBD input. It then turns the items into SOs.
export function clean(data) {
	return toSO(data.map(load => {
		load = { ...load }
		delete load.selected
		return load
	}))
}

// functionalize will add selection data to the FBD Input.
export function functionalize(data) {
	return toFO(data).map(load => ({ ...load, selected: false }))
}

// These are functions manipulating loads.

// flipLoad flips the direction of the load around.
export function flipLoad(load) {
	switch (load.type) {
		case loadTypes.force:
			return { ...load, positionedVector: load.positionedVector.reverse() }
		case loadTypes.moment:
			return { ...load, clockwise: !load.clockwise }
		default:
			throw new Error(`Invalid load type: did not recognize a load of type "${load.type}".`)
	}
}