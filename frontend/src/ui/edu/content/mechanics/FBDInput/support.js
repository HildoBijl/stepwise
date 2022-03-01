import { toFO, toSO } from 'step-wise/inputTypes'

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
