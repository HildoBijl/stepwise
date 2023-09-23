import { isBasicObject } from 'step-wise/util'
import { Variable } from 'step-wise/CAS'

import { M } from 'ui/components'

export function any() { }

// Numeric checks if the expression can be reduced to a single number and hence does not depend on variables.
export function numeric(expression) {
	if (!expression.isNumeric())
		return <>Dit is geen getal.</>
}

// validWithVariables is a validation-function-generating function. Give it a set of variables that are accepted, and it checks that only those variables are used.
export function validWithVariables(...variables) {
	// Check input.
	if (variables.length === 0)
		throw new Error(`Invalid validation function: when using the validWithVariables validation function, a list of variables must be provided. If there are no variables, then use the nonEmptyAndValid validation function.`)
	if (variables.length === 1) {
		if (variables[0] === undefined)
			throw new Error(`Invalid validation variables: when using the validWithVariables function, "undefined" was given as array of variables. This cannot be processed. Please provide actual variables.`)
		if (Array.isArray(variables[0]))
			variables = variables[0]
		if (isBasicObject(variables[0]))
			variables = Object.values(variables[0])
	}

	// Filter out non-variable elements and make sure the rest are variables.
	variables = variables.filter(term => (term instanceof Variable) || (typeof term === 'string')).map(Variable.ensureVariable)

	// Set up a validation function based on these variables.
	return (expression) => {
		const inputVariables = expression.getVariables()
		const invalidVariable = inputVariables.find(inputVariable => !variables.some(variable => variable.equalsBasic(inputVariable)))
		if (invalidVariable)
			return <>Onbekende variabele <M>{invalidVariable}</M>.</>
	}
}
