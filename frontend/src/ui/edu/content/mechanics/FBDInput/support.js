import { toFO, toSO } from 'step-wise/inputTypes'

// clean will remove all selection data from the FBD input. It then turns the items into SOs.
export function clean(FI) {
	return toSO(FI.map(load => {
		load = { ...load }
		delete load.selected
		return load
	}))
}

// functionalize will add selection data to the FBD Input.
export function functionalize(SI) {
	return toFO(SI).map(load => ({ ...load, selected: false }))
}
