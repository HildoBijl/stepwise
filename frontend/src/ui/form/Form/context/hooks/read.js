import { keysToObject } from 'step-wise/util/objects'

import { useFormData } from '../provider'

// useInputObject returns a certain input parameter. It gives the FO (functional object), unless it specifically is asked by setting the second useFI parameter to true, in which case the FI (functional input) object is returned. It's mainly used by exercises. When the ids parameter is an array, an object { id1: param1, id2: param2, ... } is returned. When undefined is given as ids, all input parameters are given.
export function useInputObject(ids, useFI = false) {
	// eslint-disable-next-line no-unused-vars
	const { getAllInputFI, getAllInputFO, getInputFI, getInputFO } = useFormData() // Input dependency is needed to update on input changes. The get-functions themselves are stable.

	// If no ID has been given, return everything.
	if (ids === undefined)
		return (useFI ? getAllInputFI : getAllInputFO)()

	// Turn each ID into the right object.
	const getParameter = useFI ? getInputFI : getInputFO
	return keysToObject(Array.isArray(ids) ? ids : [ids], id => getParameter(id))
}

// useInput is identical to useInputObject, but then returns the result as array instead of object. 
export function useInput(ids, useFI = false) {
	const inputObject = useInputObject(ids, useFI)
	return Array.isArray(ids) ? ids.map(id => inputObject[id]) : inputObject[ids]
}
