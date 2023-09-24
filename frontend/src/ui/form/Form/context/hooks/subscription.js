import React, { useCallback } from 'react'

import { processOptions, deepEquals, noop } from 'step-wise/util'
import { toSO, toFO } from 'step-wise/inputTypes'

import { useUpdater } from 'util/react'

import { useFormData } from '../provider'

/* useFormParameter gives a tuple [FI, setFI] for a single input parameter with the given id. An options object may be passed along with the following options. (Defaults defined below.)
 * - initialSI: the initial Stored Input (SI) value for the input field.
 * - validate: a function that receives the Functional Object (FO). It then either returns undefined (on all OK) or an error message (on a problem).
 * - clean: turn a Functional Input (FI) object (possibly with cursors, selections and such) into a Stored Input (SI) object (ready to be stored into the database).
 * - functionalize: turn an SI object (without cursors and without anything functional) into an FI object (possibly with cursors or functional components).
 * - feedbackCoupling: an array of field IDs to which this field is (unidirectionally) coupled. If the value of any of those fields changes, then the feedback for this field should not be shown anymore either.
 * - persistent: should the parameter stay (true) or be cleared (false) when the last subscriber unsubscribes from listening for this parameter?
 * - equals: a function that checks if two Stored Input (SI) objects are considered equal. It is used to check if the same feedback should still be shown. By default this is deepEquals.
 * - errorToMessage: a function that takes an error thrown by the interpretation (SItoFO) script and turns it into a sensible message to show to the user, preferably having as much information as possible.
 */
export const defaultUseFormParameterOptions = {
	id: undefined,
	initialSI: undefined,
	validate: noop,
	clean: FO => toSO(FO, true),
	functionalize: SI => toFO(SI, true),
	feedbackCoupling: [],
	persistent: false,
	equals: deepEquals,
	errorToMessage: () => <>Oops ... ik begrijp niet wat je hier getypt hebt.</>,
}
export function useFormParameter(options = {}) {
	options = processOptions(options, defaultUseFormParameterOptions)
	const { id, initialSI, functionalize } = options

	const { input, setInputFI, register, subscribe, unsubscribe } = useFormData()

	// Check if we're in a form.
	if (input === undefined)
		throw new Error(`Invalid form: tried to access a Form parameter, but the call was made without a Form parent being present.`)

	// Subscribe upon mounting and unsubscribe upon unmounting.
	register(options)
	useUpdater(() => {
		subscribe(id)
		return () => unsubscribe(id)
	}, [id])

	// Return the FI including a handler to reset it, just like the React setState.
	const FI = (id in input) ? input[id] : functionalize(initialSI)
	const setFI = useCallback(FI => setInputFI(id, FI), [id, setInputFI])
	return [FI, setFI]
}
