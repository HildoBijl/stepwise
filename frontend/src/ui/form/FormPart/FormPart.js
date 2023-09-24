/* FormPart is a wrapper used to tell input fields inside of it what the status of this part of the Form is. Various settings can be applied.
 * - readOnly (default false): make all input fields in this form part read-only.
* - showInputSpace (default true): set to true when there's something in the input space to show. So that's when the problem is still active, or when a previous submission has been made.
 * - showHints (default true): set to true when a problem (part) has been solved. 
 * In a containing component, use `const { readOnly, showInputSpace, showHints } = useFormPartSettings()` to check if it's done.
 */

import React, { createContext, useContext } from 'react'

import { processOptions } from 'step-wise/util'

const defaultFormPartParameters = {
	children: null,
	readOnly: false,
	showInputSpace: true,
	showHints: true,
}

const FormPartContext = createContext(defaultFormPartParameters)

export function FormPart(props) {
	const settings = processOptions(props, defaultFormPartParameters)
	return <FormPartContext.Provider value={{ ...settings, children: undefined }}>
		{props.children}
	</FormPartContext.Provider>
}

export function useFormPartSettings() {
	return useContext(FormPartContext)
}
